"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewsletterCTA() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  return (
    <section className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent p-6 md:p-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="inline-flex w-fit items-center rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-xs text-emerald-100">
            Newsletter RKC
          </div>
          <h2 className="text-xl font-semibold text-white">
            Receba conteúdos e bastidores direto no seu e-mail
          </h2>
          <p className="text-sm text-white/70">
            Cadastre-se para acompanhar matérias, projetos e novidades da Rede Kalunga
            Comunicações.
          </p>
        </div>
        <form
          className="flex w-full flex-col gap-3 sm:flex-row md:max-w-md"
          onSubmit={(event) => {
            event.preventDefault();
            const params = new URLSearchParams();
            if (email) {
              params.set("email", email);
            }
            router.push(`/newsletter${params.toString() ? `?${params.toString()}` : ""}`);
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Digite seu e-mail"
            className="flex-1 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-sm text-white placeholder:text-white/50 transition focus:border-emerald-300/70 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
          />
          <button
            type="submit"
            className="rounded-full border border-emerald-400/40 bg-emerald-500/30 px-4 py-2 text-sm text-emerald-100 transition hover:bg-emerald-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70"
          >
            Assinar
          </button>
        </form>
      </div>
    </section>
  );
}
