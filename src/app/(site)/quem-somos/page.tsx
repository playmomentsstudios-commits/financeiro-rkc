import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quem Somos | Rede Kalunga Comunicações",
  description:
    "Conheça a Rede Kalunga Comunicações e nossa atuação em comunicação comunitária, jornalismo independente e defesa do território.",
};

export default function QuemSomosPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold text-white">Quem Somos</h1>
        <p className="text-base text-white/70">
          A Rede Kalunga Comunicações é uma iniciativa formada por jovens e profissionais
          quilombolas que atuam com comunicação comunitária, jornalismo independente,
          educação, cultura e defesa do território. Nosso trabalho fortalece a memória e a
          identidade dos territórios quilombolas, ampliando vozes e articulando redes de
          colaboração.
        </p>
        <p className="text-base text-white/70">
          Atuamos com produção audiovisual, podcasts, jornalismo de proximidade e formação
          em comunicação. Em cada projeto, valorizamos a participação comunitária e a
          autonomia dos territórios.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            titulo: "Comunicação comunitária",
            texto:
              "Produzimos conteúdos que fortalecem as narrativas quilombolas e ampliam a circulação de informações locais.",
          },
          {
            titulo: "Educação e cultura",
            texto:
              "Oficinas, formação e ações culturais que valorizam a memória e a identidade do território.",
          },
          {
            titulo: "Defesa do território",
            texto:
              "Articulação social e jornalismo independente para garantir direitos e visibilidade às comunidades.",
          },
        ].map((item) => (
          <div
            key={item.titulo}
            className="rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <h3 className="text-lg font-semibold text-white">{item.titulo}</h3>
            <p className="mt-2 text-sm text-white/70">{item.texto}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
        <h2 className="text-xl font-semibold text-white">
          Quer conhecer nossos projetos e parcerias?
        </h2>
        <p className="mt-2 text-sm text-white/70">
          Descubra como nossas iniciativas transformam a comunicação nos territórios.
        </p>
        <Link
          href="/projetos"
          className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-200 hover:text-emerald-100"
        >
          Ver projetos →
        </Link>
      </section>
    </div>
  );
}
