import type { Metadata } from "next";
import { ContatoForm } from "@/components/site/ContatoForm";

export const metadata: Metadata = {
  title: "Contato | Rede Kalunga Comunicações",
  description: "Fale com a Rede Kalunga Comunicações.",
};

export default function ContatoPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-white">Contato</h1>
        <p className="text-base text-white/70">
          Entre em contato para apoiar, contratar ou construir junto com a RKC.
        </p>
      </header>

      <section className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <ContatoForm />
        </div>
        <aside className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div>
            <h2 className="text-lg font-semibold text-white">E-mail oficial</h2>
            <p className="mt-2 text-sm text-white/70">financeiro@redekalunga.org</p>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Redes</h2>
            <div className="flex flex-col gap-3">
              <a
                href="#"
                className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-4 py-2 text-center text-sm text-emerald-100"
              >
                Instagram
              </a>
              <a
                href="#"
                className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-4 py-2 text-center text-sm text-emerald-100"
              >
                YouTube
              </a>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
