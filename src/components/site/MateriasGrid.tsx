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
        <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={destaque.capa_url ?? "https://placehold.co/800x500/png"}
              alt={`Imagem da matéria ${destaque.titulo}`}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col gap-3 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">
              {formatDate(destaque.publicado_em)}
            </p>
            <h3 className="text-xl font-semibold text-white">{destaque.titulo}</h3>
            {destaque.resumo ? (
              <p className="text-sm text-white/70">{destaque.resumo}</p>
            ) : null}
            <Link
              href={`/materias/${destaque.slug}`}
              className="mt-auto text-sm text-emerald-200 hover:text-emerald-100"
            >
              Ler matéria →
            </Link>
          </div>
        </article>
      ) : null}
      <div className="grid gap-4">
        {resto.map((materia) => (
          <article
            key={materia.id}
            className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg">
              <img
                src={materia.capa_url ?? "https://placehold.co/240x160/png"}
                alt={`Imagem da matéria ${materia.titulo}`}
                className="h-full w-full object-cover"
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
                className="text-xs text-emerald-200 hover:text-emerald-100"
              >
                Ler matéria →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
