import Link from "next/link";

export function Hero() {
  return (
    <section className="relative grid gap-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-emerald-500/10 p-6 shadow-[0_20px_60px_-30px_rgba(16,185,129,0.45)] md:grid-cols-[1.2fr_1fr] md:p-10">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_55%)]"
        aria-hidden="true"
      />
      <div className="flex flex-col justify-center gap-6">
        <div className="inline-flex w-fit items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
          Rede Kalunga Comunicações
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-white md:text-4xl">
            Comunicação quilombola feita a partir do território.
          </h1>
          <p className="text-base text-white/70">
            Mídia independente de comunicação e articulação quilombola, fortalecendo
            cultura, memória e identidade.
          </p>
        </div>
        <ul className="grid gap-3 text-sm text-white/70 sm:grid-cols-3">
          <li className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            Jornalismo independente e comunitário
          </li>
          <li className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            Projetos de educação e cultura
          </li>
          <li className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            Defesa do território e memória
          </li>
        </ul>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/quem-somos"
            className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-5 py-2 text-sm text-emerald-100 transition hover:bg-emerald-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70"
          >
            Conheça a RKC
          </Link>
          <Link
            href="/materias"
            className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            Ver matérias
          </Link>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-white/10">
        <img
          src="https://placehold.co/800x600/png"
          alt="Equipe da Rede Kalunga Comunicações em atividade comunitária"
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
