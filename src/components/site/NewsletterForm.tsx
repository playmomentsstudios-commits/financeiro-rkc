"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const RATE_LIMIT_KEY = "rkc_newsletter_last_submit";

export function NewsletterForm({ initialEmail = "" }: { initialEmail?: string }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [lgpd, setLgpd] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

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

    if (!lgpd) {
      setStatus("É necessário aceitar a LGPD para continuar.");
      return;
    }

    if (!canSubmit()) {
      setStatus("Aguarde alguns segundos antes de tentar novamente.");
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    const { error } = await supabase.from("newsletter_leads").insert({
      nome: nome || null,
      email,
      lgpd: true,
    });

    if (error) {
      setStatus("Não foi possível enviar agora. Tente novamente.");
      setIsSubmitting(false);
      return;
    }

    window.localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
    setStatus("Cadastro realizado com sucesso!");
    setNome("");
    setEmail("");
    setLgpd(false);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-white/70">
          Nome (opcional)
          <input
            type="text"
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
      <label className="flex items-start gap-2 text-sm text-white/70">
        <input
          type="checkbox"
          checked={lgpd}
          onChange={(event) => setLgpd(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-white/20 bg-black/30"
        />
        <span>Concordo com o uso dos meus dados para receber conteúdos da RKC (LGPD).</span>
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
        {isSubmitting ? "Enviando..." : "Assinar"}
      </button>
      {status ? <p className="text-sm text-emerald-200">{status}</p> : null}
      <p className="text-xs text-white/50">
        Integração externa em breve (TODO). Por enquanto, seu cadastro fica salvo no
        Supabase.
      </p>
    </form>
  );
}
