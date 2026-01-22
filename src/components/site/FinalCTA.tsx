import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center md:p-10">
      <div className="mx-auto max-w-2xl space-y-4">
        <h2 className="text-2xl font-semibold text-white">
          Fortalecer a comunicação dos territórios é fortalecer o futuro.
        </h2>
        <Link
          href="/contato"
          className="inline-flex items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/20 px-5 py-2 text-sm text-emerald-100 hover:bg-emerald-500/30"
        >
          Fale com a RKC
        </Link>
      </div>
    </section>
  );
}
