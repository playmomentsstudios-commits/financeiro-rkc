import type { Metadata } from "next";
import Link from "next/link";
import { getMateriasPublicadas } from "@/lib/siteCms";

export const metadata: Metadata = {
  title: "Matérias | Rede Kalunga Comunicações",
  description: "Acompanhe as matérias da Rede Kalunga Comunicações.",
};

const tags = ["Comunicação", "Território", "Cultura", "Podcast", "Educação"];

function formatDate(date?: string | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default async function MateriasPage({
  searchParams,
}: {
  searchParams?: { tag?: string; busca?: string };
}) {
  const tag = searchParams?.tag;
  const search = searchParams?.busca;
  const materias = await getMateriasPublicadas({
    limit: 12,
    tags: tag ? [tag] : undefined,
    search: search ?? undefined,
  });

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-white">Matérias</h1>
        <p className="text-base text-white/70">
          Reportagens, entrevistas e narrativas sobre os territórios quilombolas.
        </p>
        <form className="flex flex-col gap-3 sm:flex-row" action="/materias" method="get">
          <input
            type="text"
            name="busca"
            defaultValue={search}
            placeholder="Buscar por título ou resumo"
            className="flex-1 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40"
          />
          {tag ? <input type="hidden" name="tag" value={tag} /> : null}
          <button
            type="submit"
            className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-4 py-2 text-sm text-emerald-100"
          >
            Buscar
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/materias"
            className={`rounded-full border px-3 py-1 text-xs ${
              !tag
                ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-100"
                : "border-white/20 text-white/70"
            }`}
          >
            Todas
          </Link>
          {tags.map((item) => (
            <Link
              key={item}
              href={`/materias?tag=${encodeURIComponent(item)}`}
              className={`rounded-full border px-3 py-1 text-xs ${
                tag === item
                  ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-100"
                  : "border-white/20 text-white/70"
              }`}
            >
              {item}
            </Link>
          ))}
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {materias.map((materia) => (
          <article
            key={materia.id}
            className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5"
          >
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src={materia.capa_url ?? "https://placehold.co/600x400/png"}
                alt={`Imagem da matéria ${materia.titulo}`}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">
                {formatDate(materia.publicado_em)}
              </p>
              <h2 className="text-lg font-semibold text-white">{materia.titulo}</h2>
              {materia.resumo ? (
                <p className="text-sm text-white/70">{materia.resumo}</p>
              ) : null}
              <Link
                href={`/materias/${materia.slug}`}
                className="mt-auto text-sm text-emerald-200 hover:text-emerald-100"
              >
                Ler matéria →
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
