"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Categoria = {
  id: string;
  nome: string;
  ativo: boolean | null;
  created_at?: string | null;
};

export default function AdminCategoriasPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busca, setBusca] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<Partial<Categoria>>({
    nome: "",
    ativo: true,
  });

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return categorias;
    return categorias.filter((c) => (c.nome ?? "").toLowerCase().includes(q));
  }, [categorias, busca]);

  async function reload() {
    setLoading(true);

    const { data, error } = await supabase
      .from("categorias_gasto")
      .select("id,nome,ativo,created_at")
      .order("nome", { ascending: true });

    if (error) {
      console.error("Erro categorias:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      setCategorias([]);
      setLoading(false);
      return;
    }

    setCategorias((data ?? []) as Categoria[]);
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  function novo() {
    setForm({ id: undefined, nome: "", ativo: true });
    setEditOpen(true);
  }

  function editar(categoria: Categoria) {
    setForm({
      id: categoria.id,
      nome: categoria.nome ?? "",
      ativo: categoria.ativo ?? true,
    });
    setEditOpen(true);
  }

  async function salvar() {
    if (!form.nome?.trim()) {
      alert("Informe o nome da categoria.");
      return;
    }

    setSaving(true);

    const payload = {
      nome: form.nome.trim(),
      ativo: form.ativo ?? true,
    };

    let res;
    if (form.id) {
      res = await supabase.from("categorias_gasto").update(payload).eq("id", form.id).select("id").single();
    } else {
      res = await supabase.from("categorias_gasto").insert(payload).select("id").single();
    }

    if (res.error) {
      console.error("Erro salvar categoria:", {
        message: res.error.message,
        details: res.error.details,
        hint: res.error.hint,
        code: res.error.code,
      });
      alert(`Erro ao salvar: ${res.error.message}`);
      setSaving(false);
      return;
    }

    setEditOpen(false);
    setSaving(false);
    reload();
  }

  async function excluir(id: string) {
    if (!confirm("Excluir esta categoria?")) return;

    const { error } = await supabase.from("categorias_gasto").delete().eq("id", id);
    if (error) {
      console.error("Erro excluir categoria:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      alert(`Erro ao excluir: ${error.message}`);
      return;
    }
    reload();
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-bold">Categorias</h2>
          <p className="text-sm opacity-80">Criar, editar e gerenciar categorias de gasto.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar categoria..."
            className="w-[260px] rounded-xl border border-white/15 bg-black/20 p-2.5"
          />
          <button
            onClick={novo}
            className="rounded-xl border border-white/15 bg-emerald-400/20 px-4 py-2 font-semibold"
          >
            + Nova categoria
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
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((c) => (
                <tr key={c.id} className="border-t border-white/10">
                  <td className="p-3 font-semibold">{c.nome}</td>
                  <td className="p-3">{c.ativo ? "Ativa" : "Inativa"}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => editar(c)}
                        className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => excluir(c.id)}
                        className="rounded-xl border border-white/15 bg-red-500/10 px-3 py-1.5"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtradas.length && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-sm opacity-70">
                    Nenhuma categoria encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editOpen && (
        <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4">
          <h3 className="text-sm font-bold">{form.id ? "Editar categoria" : "Nova categoria"}</h3>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs opacity-80">Nome</label>
              <input
                value={form.nome ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 p-2.5"
                placeholder="Ex.: Combustível"
              />
            </div>

            <div>
              <label className="text-xs opacity-80">Status</label>
              <select
                value={form.ativo ? "ativa" : "inativa"}
                onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.value === "ativa" }))}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 p-2.5"
              >
                <option value="ativa">Ativa</option>
                <option value="inativa">Inativa</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              disabled={saving}
              onClick={salvar}
              className="rounded-xl border border-white/15 bg-emerald-400/20 px-4 py-2 font-semibold disabled:opacity-50"
            >
              Salvar
            </button>
            <button
              disabled={saving}
              onClick={() => setEditOpen(false)}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-semibold disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
