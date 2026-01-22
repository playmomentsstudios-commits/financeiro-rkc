import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMateriasRelacionadas, getProjetoPorSlug } from "@/lib/siteCms";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const projeto = await getProjetoPorSlug(params.slug);
  if (!projeto) {
    return {
      title: "Projeto | Rede Kalunga Comunicações",
      description: "Projeto da Rede Kalunga Comunicações.",
    };
  }

  return {
    title: `${projeto.titulo} | Rede Kalunga Comunicações`,
    description: projeto.resumo ?? "Projeto da Rede Kalunga Comunicações.",
  };
}

export default async function ProjetoPage({ params }: { params: { slug: string } }) {
  const projeto = await getProjetoPorSlug(params.slug);
  if (!projeto) {
    notFound();
  }

  const tagRelacionada = projeto.tags?.[0];
  const materiasRelacionadas = await getMateriasRelacionadas(tagRelacionada, projeto.slug);
  const galeriaItems =
    Array.isArray(projeto.galeria) && projeto.galeria.length
      ? projeto.galeria
      : [
          {
            tipo: "imagem",
            url: "https://placehold.co/400x300/png",
            descricao: "Registro de atividade",
          },
          {
            tipo: "imagem",
            url: "https://placehold.co/400x300/png",
            descricao: "Encontro comunitário",
          },
          {
            tipo: "imagem",
            url: "https://placehold.co/400x300/png",
            descricao: "Produção audiovisual",
          },
        ];

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <img
            src={projeto.capa_url ?? "https://placehold.co/1200x600/png"}
            alt={`Capa do projeto ${projeto.titulo}`}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-white">{projeto.titulo}</h1>
          {projeto.resumo ? (
            <p className="text-base text-white/70">{projeto.resumo}</p>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-semibold text-white">Apresentação</h2>
          <p className="text-sm text-white/70">
            {projeto.apresentacao ??
              "Projeto em construção com foco na comunicação comunitária e fortalecimento de narrativas quilombolas."}
          </p>
        </div>
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-semibold text-white">Objetivos</h2>
          <p className="text-sm text-white/70">
            {projeto.objetivos ??
              "Promover formação, produção de conteúdo e articulação territorial em diálogo com as comunidades."}
          </p>
        </div>
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 md:col-span-2">
          <h2 className="text-xl font-semibold text-white">O que já foi realizado</h2>
          <p className="text-sm text-white/70">
            {projeto.realizado ??
              "Registros de oficinas, produções audiovisuais e mobilizações comunitárias lideradas pela RKC."}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Galeria</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {galeriaItems.map((item, index) => (
            <div
              key={`${item.url}-${index}`}
              className="overflow-hidden rounded-xl border border-white/10"
            >
              <img
                src={item.url}
                alt={item.descricao ?? `Imagem da galeria ${projeto.titulo}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Conteúdos relacionados</h2>
        {materiasRelacionadas.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {materiasRelacionadas.map((materia) => (
              <article
                key={materia.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <h3 className="text-sm font-semibold text-white">{materia.titulo}</h3>
                {materia.resumo ? (
                  <p className="mt-2 text-xs text-white/70">{materia.resumo}</p>
                ) : null}
                <Link
                  href={`/materias/${materia.slug}`}
                  className="mt-3 inline-flex text-xs text-emerald-200 hover:text-emerald-100"
                >
                  Ler matéria →
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/60">
            Em breve compartilharemos matérias relacionadas a este projeto.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
        <h2 className="text-xl font-semibold text-white">
          Quer apoiar, contratar ou construir junto?
        </h2>
        <Link
          href="/contato"
          className="mt-3 inline-flex items-center gap-2 text-sm text-emerald-200 hover:text-emerald-100"
        >
          Fale com a RKC →
        </Link>
      </section>
    </div>
  );
}
