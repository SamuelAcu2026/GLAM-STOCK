"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Search, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/app/actions/auth";

// Enlaces del menú principal. Se renderizan en el header (barra superior), nunca en un
// menú lateral. Agregar acá los futuros módulos del sistema.
const NAV_LINKS = [{ href: "/productos", label: "Productos" }];

// Buscador global de productos. Escribe el término en la URL (?q=) con debounce para
// no navegar en cada tecla. Conserva el filtro de sección que estuviera activo.
function HeaderSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const id = setTimeout(() => {
      const current = searchParams.get("q") ?? "";
      if (term === current) return; // evita navegar sin cambios (ej: al montar)

      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (term) params.set("q", term);
      else params.delete("q");
      const qs = params.toString();
      router.push(qs ? `/productos?${qs}` : "/productos");
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  return (
    <div className="relative w-full max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Buscar producto…"
        className="pl-9"
        aria-label="Buscar producto"
      />
    </div>
  );
}

// Header: barra de navegación superior fija con la marca, el menú y el buscador.
export function Header() {
  const pathname = usePathname();

  // El header no se muestra en la pantalla de login.
  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/productos" className="flex shrink-0 items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-brand-foreground">
            <Sparkles className="size-5" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">
            Glam Stock
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Suspense fallback={<div className="h-9 w-full max-w-xs" />}>
            <HeaderSearch />
          </Suspense>

          {/* Cierra la sesión (Server Action) */}
          <form action={signOutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              aria-label="Salir"
              title="Salir"
            >
              <LogOut className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
