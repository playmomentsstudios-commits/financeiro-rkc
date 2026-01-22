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

type MovimentoAnexo = {
  id: string;
  movimento_id: string;
  created_at?: string | null;
  nome?: string | null;
  arquivo_nome?: string | null;
  filename?: string | null;
  url?: string | null;
  path?: string | null;
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
  const [anexosCount, setAnexosCount] = useState<Record<string, number>>({});

  // filtros
  const [projetoId, setProjetoId] = useState<string>("");
  const [tipo, setTipo] = useState<string>("");
  const [mes, setMes] = useState<string>(""); // "2025-01"
  const [q, setQ] = useState<string>("");

  // edição
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<MovimentoRow>>({});
  const [saving, setSaving] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editAnexos, setEditAnexos] = useState<MovimentoAnexo[]>([]);

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
      setAnexosCount({});
      setLoading(false);
      return;
    }

    const fetchedRows = (data ?? []) as MovimentoRow[];
    setRows(fetchedRows);

    const ids = fetchedRows.map((row) => row.id).filter(Boolean);
    if (ids.length) {
      const { data: anexosData, error: anexosError } = await supabase
        .from("movimento_anexos")
        .select("movimento_id")
        .in("movimento_id", ids);

      if (anexosError) {
        console.error("Erro ao carregar anexos:", anexosError);
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

  async function startEdit(r: MovimentoRow) {
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
    setEditLoading(true);
    setEditAnexos([]);

    const [movimentoRes, anexosRes] = await Promise.all([
      supabase
        .from("movimentos_financeiros")
        .select("id,tipo,data,projeto_id,categoria_gasto_id,descricao,valor_total,status")
        .eq("id", r.id)
        .single(),
      supabase
        .from("movimento_anexos")
        .select("*")
        .eq("movimento_id", r.id)
        .order("created_at", { ascending: false }),
    ]);

    if (movimentoRes.error) {
      console.error("Erro ao carregar detalhes do movimento:", movimentoRes.error);
    } else if (movimentoRes.data) {
      const movimento = movimentoRes.data as any;
      setDraft({
        id: movimento.id,
        tipo: movimento.tipo,
        data_movimento: movimento.data ? String(movimento.data).slice(0, 10) : r.data_movimento?.slice(0, 10),
        projeto_id: movimento.projeto_id,
        categoria_gasto_id: movimento.categoria_gasto_id ?? null,
        descricao: movimento.descricao ?? "",
        valor_total: movimento.valor_total ?? 0,
        status: movimento.status ?? "confirmado",
      });
    }

    if (anexosRes.error) {
      console.error("Erro ao carregar anexos:", anexosRes.error);
    } else {
      setEditAnexos((anexosRes.data ?? []) as MovimentoAnexo[]);
    }

    setEditLoading(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft({});
    setEditAnexos([]);
    setEditLoading(false);
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
              <div className="col-span-3">Descrição</div>
              <div className="col-span-1 text-right">Valor</div>
              <div className="col-span-1 text-center">Anexo</div>
              <div className="col-span-1 text-right">Ações</div>
            </div>

            {rows.map((r) => {
              const isEdit = editingId === r.id;
              const count = anexosCount[r.id] ?? 0;
              return (
                <div key={r.id} className="border-b border-white/10 last:border-b-0">
                  <div className="grid grid-cols-12 gap-2 px-4 py-3 text-sm">
                    <div className="col-span-2">
                      {isEdit ? (
                        <input
                          type="date"
                          value={(draft.data_movimento as string) ?? ""}
                          onChange={(e) => setDraft((d) => ({ ...d, data_movimento: e.target.value }))}
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
                          onChange={(e) => setDraft((d) => ({ ...d, tipo: e.target.value }))}
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
                          onChange={(e) => setDraft((d) => ({ ...d, categoria_gasto_id: e.target.value || null }))}
                          className="w-full rounded-lg border border-white/15 bg-black/20 p-2 text-sm"
                        >
                          <option value="">(sem categoria)</option>
                          {categorias.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nome}
                            </option>
                          ))}
                        </select>
                      ) : (
                        r.categoria_nome ?? "—"
                      )}
                    </div>

                    <div className="col-span-3">
                      {isEdit ? (
                        <input
                          value={(draft.descricao as string) ?? ""}
                          onChange={(e) => setDraft((d) => ({ ...d, descricao: e.target.value }))}
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
                          onChange={(e) => setDraft((d) => ({ ...d, valor_total: Number(e.target.value) }))}
                          className="w-full rounded-lg border border-white/15 bg-black/20 p-2 text-sm text-right"
                        />
                      ) : (
                        moeda(r.valor_total ?? 0)
                      )}
                    </div>

                    <div className="col-span-1 flex justify-center">
                      <AnexoBadge count={count} />
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
                  {isEdit && (
                    <div className="px-4 pb-4 pt-1">
                      <AnexosPanel loading={editLoading} anexos={editAnexos} />
                    </div>
                  )}
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

function AnexoBadge({ count }: { count: number }) {
  const has = count > 0;
  return (
    <span
      className={`inline-flex h-3 w-3 rounded-full ${has ? "bg-emerald-400" : "bg-white/40"}`}
      title={has ? `${count} anexo(s)` : "Sem anexo"}
      aria-label={has ? "Com anexo" : "Sem anexo"}
    />
  );
}

function AnexosPanel({ loading, anexos }: { loading: boolean; anexos: MovimentoAnexo[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-70">Anexos</div>
      {loading && <div className="text-xs opacity-70">Carregando anexos...</div>}
      {!loading && anexos.length === 0 && <div className="text-xs opacity-70">Nenhum anexo encontrado.</div>}
      {!loading && anexos.length > 0 && (
        <ul className="grid gap-1 text-xs">
          {anexos.map((anexo) => {
            const label =
              anexo.nome ??
              anexo.arquivo_nome ??
              anexo.filename ??
              anexo.path ??
              anexo.url ??
              anexo.id;
            return (
              <li key={anexo.id} className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{label}</span>
                {anexo.url && (
                  <a className="text-emerald-200 underline" href={anexo.url} target="_blank" rel="noreferrer">
                    Abrir
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
