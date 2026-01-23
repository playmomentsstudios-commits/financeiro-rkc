"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Projeto = {
  id: string;
  nome: string;
  ano_base: number | null;
  linha_programa_id: string | null;
  total_planejado: number | null;
  ativo?: boolean | null;
  created_at?: string | null;
};

type LinhaPrograma = { id: string; nome: string };

function moeda(v: number) {
  return (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function toNumber(v: string | number | null | undefined): number {
  const cleaned = (v ?? "").toString().trim().replace(/\./g, "").replace(",", ".");
  const n = cleaned === "" ? 0 : Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export default function AdminProjetosPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [linhas, setLinhas] = useState<LinhaPrograma[]>([]);

  const [busca, setBusca] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<Partial<Projeto>>({
    nome: "",
    ano_base: new Date().getFullYear(),
    linha_programa_id: null,
    total_planejado: 0,
  });

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return projetos;
    return projetos.filter((p) => (p.nome ?? "").toLowerCase().includes(q));
  }, [projetos, busca]);

  async function reload() {
    setLoading(true);

    const [pRes, lRes] = await Promise.all([
      supabase
        .from("projetos")
        .select("id,nome,ano_base,linha_programa_id,total_planejado,ativo,created_at")
        .order("ano_base", { ascending: false })
        .order("nome", { ascending: true }),
      supabase.from("linhas_programa").select("id,nome").order("nome", { ascending: true }),
    ]);

    if (pRes.error) console.error("Erro projetos:", pRes.error);
    if (lRes.error) console.error("Erro linhas_programa:", lRes.error);

    setProjetos((pRes.data ?? []) as Projeto[]);
    setLinhas((lRes.data ?? []) as LinhaPrograma[]);
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  function novo() {
    setForm({
      id: undefined,
      nome: "",
      ano_base: new Date().getFullYear(),
      linha_programa_id: null,
      total_planejado: 0,
    });
    setEditOpen(true);
  }

  function editar(p: Projeto) {
    setForm({
      id: p.id,
      nome: p.nome ?? "",
      ano_base: p.ano_base ?? new Date().getFullYear(),
      linha_programa_id: p.linha_programa_id ?? null,
      total_planejado: p.total_planejado ?? 0,
      ativo: p.ativo ?? null,
    });
    setEditOpen(true);
  }

  async function salvar() {
    if (!form.nome?.trim()) {
      alert("Informe o nome do projeto.");
      return;
    }

    setSaving(true);

    const payload: any = {
      nome: form.nome.trim(),
      ano_base: form.ano_base ? Number(form.ano_base) : null,
      linha_programa_id: form.linha_programa_id ?? null,
      total_planejado: form.total_planejado != null ? toNumber(form.total_planejado) : null,
    };

    // se existir coluna "ativo", tentamos salvar (se não existir, Supabase retorna erro — a gente ignora)
    if (form.ativo !== undefined) payload.ativo = form.ativo;

    let res;
    if (form.id) {
      res = await supabase.from("projetos").update(payload).eq("id", form.id).select("id").single();
    } else {
      res = await supabase.from("projetos").insert(payload).select("id").single();
    }

    if (res.error) {
      console.error("Erro salvar projeto:", res.error);
      alert(`Erro ao salvar: ${res.error.message}`);
      setSaving(false);
      return;
    }

    setEditOpen(false);
    setSaving(false);
    reload();
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este projeto? Isso pode afetar planejamentos e movimentos vinculados.")) return;

    const { error } = await supabase.from("projetos").delete().eq("id", id);
    if (error) {
      console.error("Erro excluir projeto:", error);
      alert(`Erro ao excluir: ${error.message}`);
      return;
    }
    reload();
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-bold">Projetos</h2>
          <p className="text-sm opacity-80">Criar, editar e gerenciar projetos.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar projeto..."
            className="w-[260px] rounded-xl border border-white/15 bg-black/20 p-2.5"
          />
          <button
            onClick={novo}
            className="rounded-xl border border-white/15 bg-emerald-400/20 px-4 py-2 font-semibold"
          >
            + Novo projeto
          </button>
        </div>
      </div>

      {loading && <p className="mt-4">Carregando…</p>}

      {!loading && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/15">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-left">Ano</th>
                <th className="p-3 text-left">Total planejado</th>
                <th className="p-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id} className="border-t border-white/10">
                  <td className="p-3 font-semibold">{p.nome}</td>
                  <td className="p-3">{p.ano_base ?? "—"}</td>
                  <td className="p-3">{moeda(p.total_planejado ?? 0)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => editar(p)}
                        className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => excluir(p.id)}
                        className="rounded-xl border border-white/15 bg-red-500/10 px-3 py-1.5"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtrados.length === 0 && (
                <tr>
                  <td className="p-3 opacity-70" colSpan={4}>
                    Nenhum projeto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal simples */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#0b0f14] p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-bold">{form.id ? "Editar projeto" : "Novo projeto"}</h3>
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5"
              >
                Fechar
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs opacity-80">Nome</label>
                <input
                  value={form.nome ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, nome: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 p-2.5"
                />
              </div>

              <div>
                <label className="text-xs opacity-80">Ano base</label>
                <input
                  value={String(form.ano_base ?? "")}
                  onChange={(e) => setForm((s) => ({ ...s, ano_base: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 p-2.5"
                />
              </div>

              <div>
                <label className="text-xs opacity-80">Linha do programa</label>
                <select
                  value={form.linha_programa_id ?? ""}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      linha_programa_id: e.target.value ? e.target.value : null,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 p-2.5"
                >
                  <option value="">(Sem linha)</option>
                  {linhas.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs opacity-80">Total planejado</label>
                <input
                  type="number"
                  step="0.01"
                  value={String(form.total_planejado ?? 0)}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, total_planejado: toNumber(e.target.value) }))
                  }
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 p-2.5"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-semibold"
              >
                Cancelar
              </button>
              <button
                disabled={saving}
                onClick={salvar}
                className="rounded-xl border border-white/15 bg-emerald-400/20 px-4 py-2 font-semibold"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
