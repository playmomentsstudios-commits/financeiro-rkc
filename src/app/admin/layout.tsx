"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { usePathname, useRouter } from "next/navigation";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      if (!data.user) router.replace("/login");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      if (!session?.user) router.replace("/login");
    });

    return () => sub.subscription.unsubscribe();
  }, [router]);

  async function sair() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Painel ADM • RKC</h1>
            <p className="text-sm opacity-80">Gerencie tabelas, importações e cadastros.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs opacity-70">{email ?? "—"}</span>
            <button
              onClick={sair}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold"
            >
              Sair
            </button>
          </div>
        </header>

        <nav className="mt-4 flex flex-wrap gap-2">
          <NavLink href="/admin" label="Visão geral" />
          <NavLink href="/admin/projetos" label="Projetos" />
          <NavLink href="/admin/linhas-programa" label="Linhas" />
          <NavLink href="/admin/categorias" label="Categorias" />
          <NavLink href="/admin/planejamento" label="Planejamento" />
          <NavLink href="/admin/movimentos" label="Movimentos" />
          <NavLink href="/admin/anexos" label="Anexos" />
          <NavLink href="/admin/imports" label="Imports" />
          <NavLink href="/admin/profiles" label="Profiles" />
        </nav>

        <section className="mt-6">{children}</section>
      </div>
    </main>
  );
}
