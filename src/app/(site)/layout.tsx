import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rede Kalunga Comunicações",
  description:
    "Mídia independente de comunicação e articulação quilombola, fortalecendo cultura, memória e identidade.",
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-10">
        {children}
      </main>
      <footer className="border-t border-white/10 bg-black/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-white">Rede Kalunga Comunicações</p>
            <p>Comunicação quilombola feita a partir do território.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/materias" className="hover:text-white">
              Matérias
            </Link>
            <Link href="/projetos" className="hover:text-white">
              Projetos
            </Link>
            <Link href="/contato" className="hover:text-white">
              Contato
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
