import Link from "next/link";
import type { Materia } from "@/lib/siteCms";

function formatDate(date?: string | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function MateriasGrid({ materias }: { materias: Materia[] }) {
  const [destaque, ...resto] = materias;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      {destaque ? (
        <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/10">
          <div className="relative aspect-[16/9] overflow-hidden">
            <img
              src={destaque.capa_url ?? "https://placehold.co/800x500/png"}
              alt={`Imagem da matéria ${destaque.titulo}`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
              aria-hidden="true"
            />
          </div>
          <div className="flex flex-1 flex-col gap-3 p-6">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-emerald-200">
              <span>Destaque</span>
              <span className="h-1 w-1 rounded-full bg-emerald-200/70" aria-hidden />
              <span>{formatDate(destaque.publicado_em)}</span>
            </div>
            <h3 className="text-xl font-semibold text-white">{destaque.titulo}</h3>
            {destaque.resumo ? (
              <p className="text-sm text-white/70">{destaque.resumo}</p>
            ) : null}
            <Link
              href={`/materias/${destaque.slug}`}
              className="mt-auto inline-flex items-center gap-2 text-sm text-emerald-200 transition hover:text-emerald-100"
            >
              Ler matéria
              <span aria-hidden>→</span>
            </Link>
          </div>
        </article>
      ) : null}
      <div className="grid gap-4">
        {resto.map((materia) => (
          <article
            key={materia.id}
            className="group flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-white/10"
          >
            <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg">
              <img
                src={materia.capa_url ?? "https://placehold.co/240x160/png"}
                alt={`Imagem da matéria ${materia.titulo}`}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
                aria-hidden="true"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200">
                {formatDate(materia.publicado_em)}
              </p>
              <h4 className="text-sm font-semibold text-white">{materia.titulo}</h4>
              {materia.resumo ? (
                <p className="text-xs text-white/70">{materia.resumo}</p>
              ) : null}
              <Link
                href={`/materias/${materia.slug}`}
                className="inline-flex items-center gap-1 text-xs text-emerald-200 transition hover:text-emerald-100"
              >
                Ler matéria
                <span aria-hidden>→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
