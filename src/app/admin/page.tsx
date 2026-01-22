"use client";

import { useSearchParams } from "next/navigation";
import AdminFinanceiroDashboard from "@/components/admin/AdminFinanceiroDashboard";

function TabLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <a
      href={href}
      className={[
        "rounded-xl border px-4 py-2 text-sm font-semibold",
        active ? "border-emerald-300/40 bg-emerald-400/20" : "border-white/15 bg-white/5",
      ].join(" ")}
    >
      {label}
    </a>
  );
}

export default function AdminHome() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "financeiro";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <TabLink href="/admin?tab=site" active={tab === "site"} label="Site" />
        <TabLink href="/admin?tab=financeiro" active={tab === "financeiro"} label="Financeiro" />
      </div>

      <div className="mt-6">
        {tab === "site" ? (
          <section className="rounded-2xl border border-white/15 bg-white/5 p-6">
            <h2 className="text-base font-bold">Site</h2>
            <p className="mt-2 text-sm opacity-80">Em construção.</p>
          </section>
        ) : (
          <AdminFinanceiroDashboard />
        )}
      </div>
    </div>
  );
}
