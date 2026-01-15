"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type MovimentoRow = {
  id: string;
  projeto_id: string;
  projeto_nome: string;
  ano_base: number;
  tipo: string; // "ENTRADA" | "SAIDA" (ajustar conforme check)
  data_movimento: string; // ISO date
  categoria_gasto_id: string | null;
  categoria_nome: string | null;
  descricao: string | null;
  valor_total: number | null;
  status: string | null;
};

type Projeto = { id: string; nome: string; ano_base: number };
type Categoria = { id: string; nome: string };

function moeda(v: number) {
  return (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function MovimentosPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<MovimentoRow[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // filtros
  const [projetoId, setProjetoId] = useState<string>("");
  const [tipo, setTipo] = useState<string>("");
  const [mes, setMes] = useState<string>(""); // "2025-01"
  const [q, setQ] = useState<string>("");

  // edição
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<MovimentoRow>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function boot() {
      setLoading(true);

      const [{ data: prj }, { data: cat }] = await Promise.all([
        supabase.from("projetos").select("id,nome,ano_base").order("ano_base", { ascending: false }).order("nome"),
        supabase.from("categorias_gasto").select("id,nome").order("nome"),
      ]);

      setProjetos((prj ?? []) as any);
      setCategorias((cat ?? []) as any);

      setLoading(false);
    }
    boot();
  }, []);

  async function load() {
    setLoading(true);

    let query = supabase
      .from("vw_movimentos_lista")
      .select("*")
      .order("data_movimento", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200);

    if (projetoId) query = query.eq("projeto_id", projetoId);
    if (tipo) query = query.eq("tipo", tipo);
    if (mes) {
      // filtra por mês (YYYY-MM)
      query = query.gte("data_movimento", `${mes}-01`).lt("data_movimento", `${mes}-32`);
    }
    if (q.trim()) query = query.ilike("descricao", `%${q.trim()}%`);

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao listar:", error);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows((data ?? []) as any);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projetoId, tipo, mes]);

  const total = useMemo(() => {
    const entradas = rows.filter(r => String(r.tipo).toUpperCase().includes("ENT")).reduce((s, r) => s + (r.valor_total ?? 0), 0);
    const saidas = rows.filter(r => String(r.tipo).toUpperCase().includes("SAI")).reduce((s, r) => s + (r.valor_total ?? 0), 0);
    return { entradas, saidas, saldo: entradas - saidas };
  }, [rows]);

  function startEdit(r: MovimentoRow) {
    setEditingId(r.id);
    setDraft({
      id: r.id,
      tipo: r.tipo,
      data_movimento: r.data_movimento?.slice(0, 10),
      projeto_id: r.projeto_id,
      categoria_gasto_id: r.categoria_gasto_id ?? null,
      descricao: r.descricao ?? "",
      valor_total: r.valor_total ?? 0,
      status: r.status ?? "confirmado",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft({});
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);

    // Ajuste aqui para os nomes REAIS da tabela:
    const payload: any = {
      tipo: draft.tipo,
      data: draft.data_movimento,               // se sua coluna for "data"
      projeto_id: draft.projeto_id,
      categoria_gasto_id: draft.categoria_gasto_id,
      descricao: draft.descricao,
      valor_total: Number(draft.valor_total ?? 0),
      status: draft.status ?? "confirmado",
    };

    const { error } = await supabase
      .from("movimentos_financeiros")
      .update(payload)
      .eq("id", editingId);

    if (error) {
      console.error("Erro ao salvar:", error);
      alert("Falha ao salvar. Veja o console.");
      setSaving(false);
      return;
    }

    setSaving(false);
    setEditingId(null);
    setDraft({});
    await load();
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Movimentos</h1>
            <p className="text-sm opacity-80">Lista, filtros e edição dos registros.</p>
          </div>

          <a
            href="/movimentos/novo"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-emerald-400/20 px-4 py-2 font-semibold"
          >
            Novo registro
          </a>
        </header>

        <section className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 sm:grid-cols-4">
          <div>
            <label className="text-xs opacity-80">Projeto</label>
            <select value={projetoId} onChange={(e) => setProjetoId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 p-2.5">
              <option value="">Todos</option>
              {projetos.map(p => (
                <option key={p.id} value={p.id}>{p.nome} • {p.ano_base}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs opacity-80">Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 p-2.5">
              <option value="">Todos</option>
              <option value="ENTRADA">ENTRADA</option>
              <option value="SAIDA">SAIDA</option>
            </select>
          </div>

          <div>
            <label className="text-xs opacity-80">Mês</label>
            <input type="month" value={mes} onChange={(e) => setMes(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 p-2.5" />
          </div>

          <div>
            <label className="text-xs opacity-80">Buscar (descrição)</label>
            <div className="mt-1 flex gap-2">
              <input value={q} onChange={(e) => setQ(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/20 p-2.5" placeholder="Ex.: combustível, diária..." />
              <button
                onClick={load}
                className="rounded-xl border border-white/15 bg-white/5 px-4 font-semibold"
              >
                OK
              </button>
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ResumoCard titulo="Entradas (filtro atual)" valor={moeda(total.entradas)} />
          <ResumoCard titulo="Saídas (filtro atual)" valor={moeda(total.saidas)} />
          <ResumoCard titulo="Saldo (filtro atual)" valor={moeda(total.saldo)} />
        </section>

        {loading && <p className="mt-6">Carregando…</p>}

        {!loading && (
          <section className="mt-6 overflow-hidden rounded-2xl border border-white/15 bg-white/5">
            <div className="grid grid-cols-12 gap-2 border-b border-white/10 px-4 py-3 text-xs opacity-80">
              <div className="col-span-2">Data</div>
              <div className="col-span-1">Tipo</div>
              <div className="col-span-3">Categoria</div>
              <div className="col-span-4">Descrição</div>
              <div className="col-span-1 text-right">Valor</div>
              <div className="col-span-1 text-right">Ações</div>
            </div>

            {rows.map((r) => {
              const isEdit = editingId === r.id;
              return (
                <div key={r.id} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm border-b border-white/10 last:border-b-0">
                  <div className="col-span-2">
                    {isEdit ? (
                      <input
                        type="date"
                        value={(draft.data_movimento as string) ?? ""}
                        onChange={(e) => setDraft(d => ({ ...d, data_movimento: e.target.value }))}
                        className="w-full rounded-lg border border-white/15 bg-black/20 p-2 text-sm"
                      />
                    ) : (
                      new Date(r.data_movimento).toLocaleDateString("pt-BR")
                    )}
                  </div>

                  <div className="col-span-1">
                    {isEdit ? (
                      <select
                        value={(draft.tipo as string) ?? "SAIDA"}
                        onChange={(e) => setDraft(d => ({ ...d, tipo: e.target.value }))}
                        className="w-full rounded-lg border border-white/15 bg-black/20 p-2 text-sm"
                      >
                        <option value="ENTRADA">ENTRADA</option>
                        <option value="SAIDA">SAIDA</option>
                      </select>
                    ) : (
                      r.tipo
                    )}
                  </div>

                  <div className="col-span-3">
                    {isEdit ? (
                      <select
                        value={(draft.categoria_gasto_id as string) ?? ""}
                        onChange={(e) => setDraft(d => ({ ...d, categoria_gasto_id: e.target.value || null }))}
                        className="w-full rounded-lg border border-white/15 bg-black/20 p-2 text-sm"
                      >
                        <option value="">(sem categoria)</option>
                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                      </select>
                    ) : (
                      r.categoria_nome ?? "—"
                    )}
                  </div>

                  <div className="col-span-4">
                    {isEdit ? (
                      <input
                        value={(draft.descricao as string) ?? ""}
                        onChange={(e) => setDraft(d => ({ ...d, descricao: e.target.value }))}
                        className="w-full rounded-lg border border-white/15 bg-black/20 p-2 text-sm"
                        placeholder="Descrição do movimento"
                      />
                    ) : (
                      r.descricao ?? "—"
                    )}
                  </div>

                  <div className="col-span-1 text-right">
                    {isEdit ? (
                      <input
                        type="number"
                        step="0.01"
                        value={Number(draft.valor_total ?? 0)}
                        onChange={(e) => setDraft(d => ({ ...d, valor_total: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-white/15 bg-black/20 p-2 text-sm text-right"
                      />
                    ) : (
                      moeda(r.valor_total ?? 0)
                    )}
                  </div>

                  <div className="col-span-1 flex justify-end gap-2">
                    {!isEdit ? (
                      <button
                        onClick={() => startEdit(r)}
                        className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 font-semibold"
                      >
                        Editar
                      </button>
                    ) : (
                      <>
                        <button
                          disabled={saving}
                          onClick={saveEdit}
                          className="rounded-lg border border-white/15 bg-emerald-400/20 px-3 py-1 font-semibold disabled:opacity-50"
                        >
                          Salvar
                        </button>
                        <button
                          disabled={saving}
                          onClick={cancelEdit}
                          className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 font-semibold disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {!rows.length && (
              <div className="px-4 py-10 text-center text-sm opacity-80">
                Nenhum movimento encontrado com os filtros atuais.
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function ResumoCard({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
      <div className="text-xs opacity-80">{titulo}</div>
      <div className="mt-2 text-xl font-extrabold">{valor}</div>
    </div>
  );
}