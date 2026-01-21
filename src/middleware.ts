import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protege tudo dentro de /admin
  if (pathname.startsWith("/admin")) {
    // Checa cookie do Supabase (método simples)
    // Se não tiver nada, manda pra /login
    const hasAuthCookie =
      req.cookies.get("sb-access-token") ||
      req.cookies.get("supabase-auth-token");

    if (!hasAuthCookie) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
