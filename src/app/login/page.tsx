"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setLoading(false);

    if (error) {
      setErro(error.message);
      return;
    }

    router.push("/admin");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={entrar}
        className="w-full max-w-sm rounded-2xl border border-white/15 bg-white/5 p-6"
      >
        <h1 className="text-xl font-bold">Entrar no ADM</h1>
        <p className="text-sm opacity-80 mt-1">Acesso restrito.</p>

        <label className="block text-xs opacity-80 mt-5">E-mail</label>
        <input
          className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 p-2.5"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />

        <label className="block text-xs opacity-80 mt-4">Senha</label>
        <input
          className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 p-2.5"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          type="password"
          required
        />

        {erro && <p className="mt-3 text-sm text-red-400">{erro}</p>}

        <button
          disabled={loading}
          className="mt-5 w-full rounded-xl border border-white/15 bg-emerald-400/20 px-4 py-2 font-semibold"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
