import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/site/markdown";
import { getMateriaPorSlug, getMateriasRelacionadas } from "@/lib/siteCms";

function formatDate(date?: string | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const materia = await getMateriaPorSlug(params.slug);
  if (!materia) {
    return {
      title: "Matéria | Rede Kalunga Comunicações",
      description: "Matéria da Rede Kalunga Comunicações.",
    };
  }

  return {
    title: `${materia.titulo} | Rede Kalunga Comunicações`,
    description: materia.resumo ?? "Matéria da Rede Kalunga Comunicações.",
  };
}

export default async function MateriaPage({ params }: { params: { slug: string } }) {
  const materia = await getMateriaPorSlug(params.slug);
  if (!materia) {
    notFound();
  }

  const tagRelacionada = materia.tags?.[0];
  const relacionadas = await getMateriasRelacionadas(tagRelacionada, materia.slug);

  return (
    <div className="space-y-12">
      <article className="space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold text-white">{materia.titulo}</h1>
          <p className="text-sm text-white/60">
            {materia.autor ? `${materia.autor} · ` : ""}
            {formatDate(materia.publicado_em)}
          </p>
        </header>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <img
            src={materia.capa_url ?? "https://placehold.co/1200x600/png"}
            alt={`Imagem de capa da matéria ${materia.titulo}`}
            className="h-full w-full object-cover"
          />
        </div>
        <MarkdownRenderer content={materia.conteudo_md} />
      </article>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Galeria</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="overflow-hidden rounded-xl border border-white/10">
              <img
                src="https://placehold.co/400x300/png"
                alt="Imagem da galeria da matéria"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-semibold text-white">Compartilhe</h2>
        <div className="flex flex-wrap gap-4 text-sm text-emerald-200">
          <a href="#" className="hover:text-emerald-100">
            Copiar link
          </a>
          <a href="#" className="hover:text-emerald-100">
            Compartilhar no WhatsApp
          </a>
          <a href="#" className="hover:text-emerald-100">
            Compartilhar no X
          </a>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Matérias relacionadas</h2>
        {relacionadas.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {relacionadas.map((rel) => (
              <article
                key={rel.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <h3 className="text-sm font-semibold text-white">{rel.titulo}</h3>
                {rel.resumo ? (
                  <p className="mt-2 text-xs text-white/70">{rel.resumo}</p>
                ) : null}
                <Link
                  href={`/materias/${rel.slug}`}
                  className="mt-3 inline-flex text-xs text-emerald-200 hover:text-emerald-100"
                >
                  Ler matéria →
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/60">
            Em breve compartilharemos mais conteúdos relacionados.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
        <h2 className="text-xl font-semibold text-white">Receba novidades no seu e-mail</h2>
        <p className="mt-2 text-sm text-white/70">
          Inscreva-se para acompanhar matérias, bastidores e novidades da RKC.
        </p>
        <Link
          href="/newsletter"
          className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-200 hover:text-emerald-100"
        >
          Assinar newsletter →
        </Link>
      </section>
    </div>
  );
}
