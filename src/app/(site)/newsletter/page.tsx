import type { Metadata } from "next";
import { NewsletterForm } from "@/components/site/NewsletterForm";

export const metadata: Metadata = {
  title: "Newsletter | Rede Kalunga Comunicações",
  description: "Assine a newsletter da Rede Kalunga Comunicações.",
};

export default function NewsletterPage({
  searchParams,
}: {
  searchParams?: { email?: string };
}) {
  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-white">Newsletter</h1>
        <p className="text-base text-white/70">
          Receba matérias, bastidores e novidades da Rede Kalunga Comunicações diretamente
          no seu e-mail.
        </p>
      </header>
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <NewsletterForm initialEmail={searchParams?.email ?? ""} />
      </section>
    </div>
  );
}
