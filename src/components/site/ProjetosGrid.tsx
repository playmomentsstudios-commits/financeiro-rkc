import Link from "next/link";
import type { ProjetoSite } from "@/lib/siteCms";

export function ProjetosGrid({ projetos }: { projetos: ProjetoSite[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {projetos.map((projeto) => (
        <article
          key={projeto.id}
          className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5"
        >
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={projeto.capa_url ?? "https://placehold.co/600x400/png"}
              alt={`Capa do projeto ${projeto.titulo}`}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col gap-4 p-5">
            <div>
              <h3 className="text-lg font-semibold text-white">{projeto.titulo}</h3>
              {projeto.resumo ? (
                <p className="mt-2 text-sm text-white/70">{projeto.resumo}</p>
              ) : null}
            </div>
            <div className="mt-auto">
              <Link
                href={`/projetos/${projeto.slug}`}
                className="inline-flex items-center gap-2 text-sm text-emerald-200 hover:text-emerald-100"
              >
                Ver projeto
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
