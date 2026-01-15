"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import GraficoMensal from "@/components/GraficoMensal";
import TabelaCategorias from "@/components/TabelaCategorias";

type ResumoProjeto = {
  projeto_id: string;
  nome: string;
  ano_base: number;
  linha_programa: string | null;
  total_planejado: number;
  total_executado: number;
  total_entradas: number;
  saldo_planejado: number;
};

type MensalRow = {
  mes: string;
  entradas: number;
  saidas: number;
};

type CategoriaRow = {
  categoria: string;
  valor_planejado: number;
  valor_executado: number;
  saldo: number;
  execucao_percentual: number | null;
};

function moeda(v: number) {
  return (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [projetos, setProjetos] = useState<ResumoProjeto[]>([]);
  const [projetoId, setProjetoId] = useState<string>("");

  // >>> Dados do gráfico mensal
  const [mensal, setMensal] = useState<MensalRow[]>([]);
  const [loadingMensal, setLoadingMensal] = useState(false);

  // >>> Dados da tabela por categoria
  const [categorias, setCategorias] = useState<CategoriaRow[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);

  // 1) Carrega lista de projetos e seleciona o primeiro
  useEffect(() => {
    async function loadProjetos() {
      setLoading(true);

      const { data, error } = await supabase
        .from("vw_resumo_projetos")
        .select("*")
        .order("ano_base", { ascending: false })
        .order("nome", { ascending: true });

      if (error) {
        console.error("Erro vw_resumo_projetos:", error);
        setProjetos([]);
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as ResumoProjeto[];
      setProjetos(rows);

      if (!projetoId && rows.length) {
        setProjetoId(rows[0].projeto_id);
      }

      setLoading(false);
    }

    loadProjetos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const projetoAtual = useMemo(
    () => projetos.find((p) => p.projeto_id === projetoId),
    [projetos, projetoId]
  );

  // 2) PASSO 2.3 (EXATO): quando mudar o projeto, carregar mensal + categorias
  useEffect(() => {
    async function loadMensal() {
      if (!projetoId) return;

      setLoadingMensal(true);

      const { data, error } = await supabase
        .from("vw_executado_por_mes")
        .select("mes,total_entradas,total_saidas")
        .eq("projeto_id", projetoId)
        .order("mes", { ascending: true });

      if (error) {
        console.error("Erro vw_executado_por_mes:", JSON.stringify(error, null, 2));
        setMensal([]);
        setLoadingMensal(false);
        return;
      }

      const rows: MensalRow[] = (data ?? []).map((r: any) => ({
        mes: new Date(r.mes).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
        entradas: Number(r.total_entradas ?? 0),
        saidas: Number(r.total_saidas ?? 0),
      }));

      setMensal(rows);
      setLoadingMensal(false);
    }

    async function loadCategorias() {
      if (!projetoId) return;

      setLoadingCategorias(true);

      const { data, error } = await supabase
        .from("vw_planejado_executado_categoria")
        .select("categoria,valor_planejado,valor_executado,saldo,execucao_percentual")
        .eq("projeto_id", projetoId)
        .order("valor_planejado", { ascending: false });

      if (error) {
        console.error("Erro vw_planejado_executado_categoria:", error);
        setCategorias([]);
        setLoadingCategorias(false);
        return;
      }

      setCategorias((data ?? []) as CategoriaRow[]);
      setLoadingCategorias(false);
    }

    loadMensal();
    loadCategorias();
  }, [projetoId]);

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Financeiro • RKC</h1>
            <p className="text-sm opacity-80">
              Visão consolidada por projeto (Planejado × Executado).
            </p>
          </div>

          <div className="w-full sm:w-[520px]">
            <label className="text-xs opacity-80">Projeto</label>
            <select
              value={projetoId}
              onChange={(e) => setProjetoId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 p-2.5"
            >
              {projetos.map((p) => (
                <option key={p.projeto_id} value={p.projeto_id}>
                  {p.nome} • {p.ano_base} {p.linha_programa ? `• ${p.linha_programa}` : ""}
                </option>
              ))}
            </select>
          </div>
        </header>

        {loading && <p className="mt-6">Carregando…</p>}

        {!loading && !projetoAtual && (
          <div className="mt-6 rounded-xl border border-white/15 bg-white/5 p-4">
            <p className="text-sm">
              Nenhum projeto retornou dados. Verifique se a view{" "}
              <code className="rounded bg-black/30 px-1">vw_resumo_projetos</code>{" "}
              existe no schema <code className="rounded bg-black/30 px-1">public</code>{" "}
              e se há dados cadastrados.
            </p>
          </div>
        )}

        {!loading && projetoAtual && (
          <>
            {/* Cards */}
            <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Card titulo="Total Planejado" valor={moeda(projetoAtual.total_planejado)} />
              <Card titulo="Total Executado (Saídas)" valor={moeda(projetoAtual.total_executado)} />
              <Card titulo="Total Entradas" valor={moeda(projetoAtual.total_entradas)} />
              <Card titulo="Saldo (Planejado - Executado)" valor={moeda(projetoAtual.saldo_planejado)} />
            </section>

            {/* Ações */}
            <section className="mt-4 flex flex-wrap gap-3">
              <a
                href="/movimentos"
                className="rounded-xl border border-white/15 bg-emerald-400/20 px-4 py-2 font-semibold"
              >
                Registrar movimento
              </a>
              <a
                href="/relatorios"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-semibold"
              >
                Gerar relatório (PDF/SVG)
              </a>
            </section>

            {/* Gráfico Mensal */}
            <section className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-base font-bold">Entradas × Saídas por mês</h2>
                {loadingMensal && <span className="text-xs opacity-70">Carregando…</span>}
              </div>

              <div className="mt-3">
                <GraficoMensal data={mensal} />
                {!loadingMensal && mensal.length === 0 && (
                  <p className="mt-2 text-sm opacity-70">
                    Ainda não há movimentos registrados para este projeto (entradas/saídas).
                  </p>
                )}
              </div>
            </section>

            {/* Categorias */}
            <section className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-base font-bold">Planejado × Executado por categoria</h2>
                {loadingCategorias && <span className="text-xs opacity-70">Carregando…</span>}
              </div>

              <div className="mt-3">
                <TabelaCategorias data={categorias} />
                {!loadingCategorias && categorias.length === 0 && (
                  <p className="mt-2 text-sm opacity-70">
                    Nenhuma categoria retornou dados. (Verifique planejamento_itens e categorias_gasto).
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function Card({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
      <div className="text-xs opacity-80">{titulo}</div>
      <div className="mt-2 text-xl font-extrabold">{valor}</div>
    </div>
  );
}
