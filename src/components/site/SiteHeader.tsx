"use client";

import Link from "next/link";
import { useState } from "react";
import { projetosMenu, siteNav } from "./siteNav";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-white/10 bg-black/60 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-white">
          RKC
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
          {siteNav.map((item) =>
            item.label === "Projetos" ? (
              <div key={item.href} className="group relative">
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
                <div className="absolute left-0 top-6 hidden min-w-[220px] flex-col gap-2 rounded-lg border border-white/10 bg-black/95 p-3 text-xs text-white/70 shadow-xl group-hover:flex">
                  {projetosMenu.map((proj) => (
                    <Link
                      key={proj.href}
                      href={proj.href}
                      className="rounded px-2 py-1 hover:bg-white/10 hover:text-white"
                    >
                      {proj.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ),
          )}
        </nav>
        <button
          className="rounded border border-white/20 px-3 py-2 text-xs text-white md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls="site-menu"
          type="button"
        >
          Menu
        </button>
      </div>
      {open ? (
        <div
          id="site-menu"
          className="border-t border-white/10 bg-black/90 px-4 py-4 text-sm text-white/80 md:hidden"
        >
          <div className="flex flex-col gap-3">
            {siteNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded px-2 py-1 hover:bg-white/10 hover:text-white"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
