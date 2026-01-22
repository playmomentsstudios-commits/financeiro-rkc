"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewsletterCTA() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  return (
    <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 md:p-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Newsletter</h2>
          <p className="text-sm text-white/70">
            Receba matérias, bastidores e novidades da Rede Kalunga Comunicações diretamente
            no seu e-mail.
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
            className="flex-1 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-sm text-white placeholder:text-white/50"
          />
          <button
            type="submit"
            className="rounded-full border border-emerald-400/40 bg-emerald-500/30 px-4 py-2 text-sm text-emerald-100"
          >
            Assinar
          </button>
        </form>
      </div>
    </section>
  );
}
