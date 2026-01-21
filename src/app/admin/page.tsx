"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function Card({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
      <div className="text-xs opacity-80">{titulo}</div>
      <div className="mt-2 text-xl font-extrabold">{valor}</div>
    </div>
  );
}

export default function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    projetos: 0,
    categorias: 0,
    movimentos: 0,
    planejamento: 0,
    anexos: 0,
  });

  useEffect(() => {
    async function load() {
      setLoading(true);

      const [p, c, m, pl, a] = await Promise.all([
        supabase.from("projetos").select("id", { count: "exact", head: true }),
        supabase.from("categorias_gasto").select("id", { count: "exact", head: true }),
        supabase.from("movimentos_financeiros").select("id", { count: "exact", head: true }),
        supabase.from("planejamento_itens").select("id", { count: "exact", head: true }),
        supabase.from("movimento_anexos").select("id", { count: "exact", head: true }),
      ]);

      setCounts({
        projetos: p.count ?? 0,
        categorias: c.count ?? 0,
        movimentos: m.count ?? 0,
        planejamento: pl.count ?? 0,
        anexos: a.count ?? 0,
      });

      setLoading(false);
    }

    load();
  }, []);

  return (
    <div>
      <h2 className="text-base font-bold">Visão geral</h2>
      <p className="mt-1 text-sm opacity-80">
        Acesso administrativo às tabelas do sistema.
      </p>

      {loading && <p className="mt-4">Carregando…</p>}

      {!loading && (
        <section className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Card titulo="Projetos" valor={String(counts.projetos)} />
          <Card titulo="Categorias" valor={String(counts.categorias)} />
          <Card titulo="Movimentos" valor={String(counts.movimentos)} />
          <Card titulo="Planejamento" valor={String(counts.planejamento)} />
          <Card titulo="Anexos" valor={String(counts.anexos)} />
        </section>
      )}
    </div>
  );
}
