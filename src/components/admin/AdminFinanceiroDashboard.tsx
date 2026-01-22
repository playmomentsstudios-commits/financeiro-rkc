"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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

type MovimentoRecente = {
  id: string;
  data: string;
  tipo: string;
  valor_total: number | null;
  descricao: string | null;
  categoria_gasto_id: string | null;
};

function moeda(v: number) {
  return (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatMesLabel(mes: any) {
  if (!mes) return "";

  if (typeof mes === "string" && /^\d{4}-\d{2}$/.test(mes)) {
    mes = `${mes}-01`;
  }

  const d = new Date(mes);
  if (Number.isNaN(d.getTime())) return String(mes);

  return d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

function TabLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <a
      href={href}
      className={[
        "rounded-xl border px-3 py-2 text-sm font-semibold",
        active ? "border-emerald-300/40 bg-emerald-400/20" : "border-white/15 bg-white/5",
      ].join(" ")}
    >
      {label}
    </a>
  );
}

function EditLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold"
    >
      {label}
    </a>
  );
}

function AnexoIndicator({ count }: { count: number }) {
  const has = count > 0;
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`inline-flex h-3 w-3 rounded-full ${has ? "bg-emerald-400" : "bg-white/40"}`}
        aria-label={has ? "Com anexo" : "Sem anexo"}
      />
      {has && <span className="text-xs font-semibold">{count}</span>}
    </span>
  );
}

export default function AdminFinanceiroDashboard() {
  const searchParams = useSearchParams();
  const finTab = searchParams.get("finTab") ?? "visao";

  const [loadingProjetos, setLoadingProjetos] = useState(true);
  const [projetos, setProjetos] = useState<ResumoProjeto[]>([]);
  const [projetoId, setProjetoId] = useState<string>("");

  const [mensal, setMensal] = useState<MensalRow[]>([]);
  const [loadingMensal, setLoadingMensal] = useState(false);

  const [categorias, setCategorias] = useState<CategoriaRow[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);

  const [movimentos, setMovimentos] = useState<MovimentoRecente[]>([]);
  const [loadingMovimentos, setLoadingMovimentos] = useState(false);
  const [anexosCount, setAnexosCount] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadProjetos() {
      setLoadingProjetos(true);

      const { data, error } = await supabase
        .from("vw_resumo_projetos")
        .select("*")
        .order("ano_base", { ascending: false })
        .order("nome", { ascending: true });

      if (error) {
        console.error("Erro vw_resumo_projetos:", error);
        setProjetos([]);
        setLoadingProjetos(false);
        return;
      }

      const rows = (data ?? []) as ResumoProjeto[];
      setProjetos(rows);

      if (!projetoId && rows.length) {
        setProjetoId(rows[0].projeto_id);
      }

      setLoadingProjetos(false);
    }

    loadProjetos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const projetoAtual = useMemo(
    () => projetos.find((p) => p.projeto_id === projetoId),
    [projetos, projetoId]
  );

  useEffect(() => {
    async function loadMensal() {
      if (!projetoId) return;

      setLoadingMensal(true);

      const { data, error } = await supabase
        .from("vw_executado_por_mes")
        .select("mes,entradas,saidas")
        .eq("projeto_id", projetoId)
        .order("mes", { ascending: true });

      if (error) {
        console.error("Erro vw_executado_por_mes:", JSON.stringify(error, null, 2));
        setMensal([]);
        setLoadingMensal(false);
        return;
      }

      const rows: MensalRow[] = (data ?? []).map((r: any) => ({
        mes: formatMesLabel(r.mes),
        entradas: Number(r.entradas ?? 0),
        saidas: Number(r.saidas ?? 0),
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

    async function loadMovimentos() {
      if (!projetoId) {
        setMovimentos([]);
        setAnexosCount({});
        return;
      }

      setLoadingMovimentos(true);

      const { data, error } = await supabase
        .from("movimentos_financeiros")
        .select("id,data,tipo,valor_total,descricao,categoria_gasto_id")
        .eq("projeto_id", projetoId)
        .order("data", { ascending: false })
        .limit(15);

      if (error) {
        console.error("Erro movimentos_financeiros:", error);
        setMovimentos([]);
        setAnexosCount({});
        setLoadingMovimentos(false);
        return;
      }

      const rows = (data ?? []) as MovimentoRecente[];
      setMovimentos(rows);

      const ids = rows.map((row) => row.id).filter(Boolean);
      if (ids.length) {
        const { data: anexosData, error: anexosError } = await supabase
          .from("movimento_anexos")
          .select("movimento_id")
          .in("movimento_id", ids);

        if (anexosError) {
          console.error("Erro movimento_anexos:", anexosError);
          setAnexosCount({});
        } else {
          const counts = (anexosData ?? []).reduce<Record<string, number>>((acc, item: any) => {
            const key = String(item.movimento_id);
            acc[key] = (acc[key] ?? 0) + 1;
            return acc;
          }, {});
          setAnexosCount(counts);
        }
      } else {
        setAnexosCount({});
      }

      setLoadingMovimentos(false);
    }

    loadMensal();
    loadCategorias();
    loadMovimentos();
  }, [projetoId]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <TabLink
          href="/admin?tab=financeiro&finTab=visao"
          active={finTab === "visao"}
          label="Visão Geral"
        />
        <TabLink
          href="/admin?tab=financeiro&finTab=edicao"
          active={finTab === "edicao"}
          label="Edição"
        />
      </div>

      {finTab === "edicao" && (
        <section className="mt-4 flex flex-wrap gap-2">
          <EditLink href="/admin/projetos" label="Projetos" />
          <EditLink href="/admin/linhas-programa" label="Linhas" />
          <EditLink href="/admin/categorias" label="Categorias" />
          <EditLink href="/admin/planejamento" label="Planejamento" />
          <EditLink href="/admin/movimentos" label="Movimentos" />
          <EditLink href="/admin/anexos" label="Anexos" />
          <EditLink href="/admin/imports" label="Imports" />
          <EditLink href="/admin/profiles" label="Perfis" />
        </section>
      )}

      {finTab === "visao" && (
        <div className="mt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-bold">Visão Geral Financeira</h2>
              <p className="text-sm opacity-80">Resumo compacto do financeiro por projeto.</p>
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
          </div>

          {loadingProjetos && <p className="mt-6">Carregando…</p>}

          {!loadingProjetos && !projetoAtual && (
            <div className="mt-6 rounded-xl border border-white/15 bg-white/5 p-4">
              <p className="text-sm">
                Nenhum projeto retornou dados. Verifique se a view{" "}
                <code className="rounded bg-black/30 px-1">vw_resumo_projetos</code> existe e se
                há dados cadastrados.
              </p>
            </div>
          )}

          {!loadingProjetos && projetoAtual && (
            <>
              <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Card titulo="Total Planejado" valor={moeda(projetoAtual.total_planejado)} />
                <Card titulo="Total Executado (Saídas)" valor={moeda(projetoAtual.total_executado)} />
                <Card titulo="Total Entradas" valor={moeda(projetoAtual.total_entradas)} />
                <Card titulo="Saldo (Planejado - Executado)" valor={moeda(projetoAtual.saldo_planejado)} />
              </section>

              <section className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-base font-bold">Entradas × Saídas por mês</h3>
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

              <section className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-base font-bold">Planejado × Executado por categoria</h3>
                  {loadingCategorias && <span className="text-xs opacity-70">Carregando…</span>}
                </div>

                <div className="mt-3">
                  <TabelaCategorias data={categorias} />
                  {!loadingCategorias && categorias.length === 0 && (
                    <p className="mt-2 text-sm opacity-70">
                      Nenhuma categoria retornou dados para este projeto.
                    </p>
                  )}
                </div>
              </section>

              <section className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-bold">Movimentos recentes</h3>
                    <p className="text-sm opacity-70">Últimos 15 registros com indicador de anexos.</p>
                  </div>
                  <a
                    href="/admin/movimentos"
                    className="rounded-xl border border-white/15 bg-emerald-400/20 px-4 py-2 text-sm font-semibold"
                  >
                    Ver todos os movimentos
                  </a>
                </div>

                {loadingMovimentos && <p className="mt-4 text-sm">Carregando movimentos…</p>}

                {!loadingMovimentos && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                    <div className="grid grid-cols-12 gap-2 border-b border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-wide opacity-70">
                      <div className="col-span-2">Data</div>
                      <div className="col-span-2">Tipo</div>
                      <div className="col-span-2 text-right">Valor</div>
                      <div className="col-span-4">Descrição</div>
                      <div className="col-span-1 text-center">Anexo</div>
                      <div className="col-span-1 text-right">Ações</div>
                    </div>

                    {movimentos.map((mov) => (
                      <div
                        key={mov.id}
                        className="grid grid-cols-12 gap-2 border-b border-white/10 px-4 py-2 text-sm last:border-b-0"
                      >
                        <div className="col-span-2">
                          {mov.data ? new Date(mov.data).toLocaleDateString("pt-BR") : "—"}
                        </div>
                        <div className="col-span-2 font-semibold">{mov.tipo ?? "—"}</div>
                        <div className="col-span-2 text-right">{moeda(mov.valor_total ?? 0)}</div>
                        <div className="col-span-4 truncate" title={mov.descricao ?? ""}>
                          {mov.descricao ?? "—"}
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                          <AnexoIndicator count={anexosCount[mov.id] ?? 0} />
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <a
                            href="/admin/movimentos"
                            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold"
                          >
                            Editar
                          </a>
                        </div>
                      </div>
                    ))}

                    {!movimentos.length && (
                      <div className="px-4 py-6 text-center text-sm opacity-70">
                        Nenhum movimento encontrado para este projeto.
                      </div>
                    )}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      )}
    </div>
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
