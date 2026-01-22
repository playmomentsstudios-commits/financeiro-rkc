import Link from "next/link";

export function Hero() {
  return (
    <section className="grid gap-10 rounded-2xl border border-white/10 bg-white/5 p-6 md:grid-cols-[1.2fr_1fr] md:p-10">
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
        <div className="flex flex-wrap gap-3">
          <Link
            href="/quem-somos"
            className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-5 py-2 text-sm text-emerald-100 transition hover:bg-emerald-500/30"
          >
            Conheça a RKC
          </Link>
          <Link
            href="/materias"
            className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm text-white transition hover:bg-white/20"
          >
            Ver matérias
          </Link>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <img
          src="https://placehold.co/800x600/png"
          alt="Equipe da Rede Kalunga Comunicações em atividade comunitária"
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  );
}
