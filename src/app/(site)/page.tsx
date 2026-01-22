import type { Metadata } from "next";
import Link from "next/link";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Hero } from "@/components/site/Hero";
import { MateriasGrid } from "@/components/site/MateriasGrid";
import { NewsletterCTA } from "@/components/site/NewsletterCTA";
import { ProjetosGrid } from "@/components/site/ProjetosGrid";
import { getMateriasPublicadas, getProjetosPublicados } from "@/lib/siteCms";

export const metadata: Metadata = {
  title: "Home | Rede Kalunga Comunicações",
  description:
    "Comunicação quilombola feita a partir do território. Conheça projetos e matérias da Rede Kalunga Comunicações.",
};

export default async function HomePage() {
  const [projetos, materias] = await Promise.all([
    getProjetosPublicados(),
    getMateriasPublicadas({ limit: 6 }),
  ]);

  return (
    <div className="flex flex-col gap-16">
      <Hero />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Quem Somos</h2>
        <p className="max-w-3xl text-base text-white/70">
          A Rede Kalunga Comunicações é uma iniciativa formada por jovens e profissionais
          quilombolas que atuam com comunicação comunitária, jornalismo independente,
          educação, cultura e defesa do território.
        </p>
        <Link
          href="/quem-somos"
          className="inline-flex items-center gap-2 text-sm text-emerald-200 hover:text-emerald-100"
        >
          → Saiba mais sobre a RKC
        </Link>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Projetos</h2>
          <Link href="/projetos" className="text-sm text-emerald-200 hover:text-emerald-100">
            Ver todos
          </Link>
        </div>
        <ProjetosGrid projetos={projetos.slice(0, 4)} />
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Últimas Matérias</h2>
          <Link href="/materias" className="text-sm text-emerald-200 hover:text-emerald-100">
            → Ver todas as matérias
          </Link>
        </div>
        <MateriasGrid materias={materias} />
      </section>

      <NewsletterCTA />

      <FinalCTA />
    </div>
  );
}
