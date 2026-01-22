"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const RATE_LIMIT_KEY = "rkc_contato_last_submit";

export function ContatoForm() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = () => {
    if (typeof window === "undefined") return true;
    const lastSubmit = Number(window.localStorage.getItem(RATE_LIMIT_KEY) ?? 0);
    return Date.now() - lastSubmit > 10000;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (honeypot) {
      setStatus("Envio bloqueado.");
      return;
    }

    if (!canSubmit()) {
      setStatus("Aguarde alguns segundos antes de tentar novamente.");
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    const { error } = await supabase.from("contato_msgs").insert({
      nome,
      email,
      assunto: assunto || null,
      mensagem,
    });

    if (error) {
      setStatus("Não foi possível enviar agora. Tente novamente.");
      setIsSubmitting(false);
      return;
    }

    window.localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
    setStatus("Mensagem enviada! Em breve retornaremos.");
    setNome("");
    setEmail("");
    setAssunto("");
    setMensagem("");
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-white/70">
          Nome
          <input
            type="text"
            required
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-sm text-white"
          />
        </label>
        <label className="space-y-2 text-sm text-white/70">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-sm text-white"
          />
        </label>
      </div>
      <label className="space-y-2 text-sm text-white/70">
        Assunto
        <input
          type="text"
          value={assunto}
          onChange={(event) => setAssunto(event.target.value)}
          className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-sm text-white"
        />
      </label>
      <label className="space-y-2 text-sm text-white/70">
        Mensagem
        <textarea
          required
          value={mensagem}
          onChange={(event) => setMensagem(event.target.value)}
          rows={5}
          className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-sm text-white"
        />
      </label>
      <div className="sr-only" aria-hidden>
        <label>
          Não preencher
          <input
            type="text"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-5 py-2 text-sm text-emerald-100 disabled:opacity-60"
      >
        {isSubmitting ? "Enviando..." : "Enviar"}
      </button>
      {status ? <p className="text-sm text-emerald-200">{status}</p> : null}
    </form>
  );
}
