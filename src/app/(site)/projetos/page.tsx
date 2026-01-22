import type { Metadata } from "next";
import Link from "next/link";
import { ProjetosGrid } from "@/components/site/ProjetosGrid";
import { getProjetosPublicados } from "@/lib/siteCms";

export const metadata: Metadata = {
  title: "Projetos | Rede Kalunga Comunicações",
  description: "Conheça os projetos da Rede Kalunga Comunicações.",
};

const tags = ["Comunicação", "Educação", "Podcast", "Audiovisual"];

export default async function ProjetosPage({
  searchParams,
}: {
  searchParams?: { tag?: string };
}) {
  const tag = searchParams?.tag;
  const projetos = await getProjetosPublicados(tag);

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-white">Projetos</h1>
        <p className="text-base text-white/70">
          Iniciativas que fortalecem a comunicação quilombola, cultura e memória nos
          territórios.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/projetos"
            className={`rounded-full border px-3 py-1 text-xs ${
              !tag
                ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-100"
                : "border-white/20 text-white/70"
            }`}
          >
            Todos
          </Link>
          {tags.map((item) => (
            <Link
              key={item}
              href={`/projetos?tag=${encodeURIComponent(item)}`}
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
      <ProjetosGrid projetos={projetos} />
    </div>
  );
}
