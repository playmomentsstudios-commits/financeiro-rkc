"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Projeto = { id: string; nome: string; ano_base: number };
type Categoria = { id: string; nome: string };

export default function NovoMovimentoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // campos
  const [projetoId, setProjetoId] = useState("");
  const [tipo, setTipo] = useState("SAIDA"); // ou ENTRADA
  const [dataMov, setDataMov] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [categoriaId, setCategoriaId] = useState<string>("");
  const [descricao, setDescricao] = useState("");
  const [valorTotal, setValorTotal] = useState<number>(0);

  useEffect(() => {
    async function boot() {
      setLoading(true);

      const [{ data: prj }, { data: cat }] = await Promise.all([
        supabase.from("projetos").select("id,nome,ano_base").order("ano_base", { ascending: false }).order("nome"),
        supabase.from("categorias_gasto").select("id,nome").order("nome"),
      ]);

      const prjs = (prj ?? []) as any;
      setProjetos(prjs);
      setCategorias((cat ?? []) as any);

      if (prjs.length) setProjetoId(prjs[0].id);

      setLoading(false);
    }
    boot();
  }, []);

  const valido = useMemo(() => {
    return Boolean(projetoId && tipo && dataMov && descricao.trim() && Number(valorTotal) > 0);
  }, [projetoId, tipo, dataMov, descricao, valorTotal]);

  async function salvar() {
    if (!valido) return;
    setSaving(true);

    // Ajuste nomes conforme seu schema:
    const payload: any = {
      projeto_id: projetoId,
      tipo,                         // "ENTRADA"/"SAIDA"
      data: dataMov,                // se sua coluna for "data"
      categoria_gasto_id: categoriaId || null,
      descricao: descricao.trim(),
      valor_total: Number(valorTotal),
      status: "confirmado",
    };

    const { data, error } = await supabase
      .from("movimentos_financeiros")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      console.error("Erro ao inserir:", error);
      alert("Falha ao salvar. Veja o console.");
      setSaving(false);
      return;
    }

    const newId = data?.id;
    setSaving(false);

    // Próximo passo: anexos (vamos criar na sequência)
    window.location.href = `/movimentos?created=${newId}`;
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Novo movimento</h1>
            <p className="text-sm opacity-80">Registrar entrada ou saída.</p>
          </div>
          <a href="/movimentos" className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-semibold">
            Voltar
          </a>
        </header>

        {loading && <p className="mt-6">Carregando…</p>}

        {!loading && (
          <section className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4 space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs opacity-80">Projeto</label>
                <select value={projetoId} onChange={(e) => setProjetoId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 p-2.5">
                  {projetos.map(p => (
                    <option key={p.id} value={p.id}>{p.nome} • {p.ano_base}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs opacity-80">Tipo</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 p-2.5">
                  <option value="ENTRADA">ENTRADA</option>
                  <option value="SAIDA">SAIDA</option>
                </select>
              </div>

              <div>
                <label className="text-xs opacity-80">Data</label>
                <input type="date" value={dataMov} onChange={(e) => setDataMov(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 p-2.5" />
              </div>

              <div>
                <label className="text-xs opacity-80">Categoria</label>
                <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 p-2.5">
                  <option value="">(sem categoria)</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs opacity-80">Descrição</label>
              <input value={descricao} onChange={(e) => setDescricao(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 p-2.5"
                placeholder="Detalhe do movimento (ex.: serviços contábeis, combustível...)"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs opacity-80">Valor total</label>
                <input type="number" step="0.01" value={valorTotal}
                  onChange={(e) => setValorTotal(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 p-2.5"
                />
              </div>

              <div className="flex items-end">
                <button
                  disabled={!valido || saving}
                  onClick={salvar}
                  className="w-full rounded-xl border border-white/15 bg-emerald-400/20 px-4 py-3 font-semibold disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Registrar movimento"}
                </button>
              </div>
            </div>

            <div className="text-xs opacity-70">
              Próximo: anexar comprovantes (PDF/IMG até 20MB) após salvar.
            </div>
          </section>
        )}
      </div>
    </main>
  );
}