"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  buildProductsUrl,
  type Category,
} from "@/lib/products";

type Props = {
  categorySections: Record<Category, string[]>;
  query: string;
  activeCategory: Category | "";
  activeSection: string;
  outOfStock: boolean;
};

// Panel de filtros lateral (acordeón): primero se elige la categoría y al seleccionarla
// se despliegan sus secciones. Todo se resuelve por URL para que el filtro sea compartible.
export function ProductFilters({
  categorySections,
  query,
  activeCategory,
  activeSection,
  outOfStock,
}: Props) {
  const router = useRouter();

  function go(url: string) {
    router.push(url);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold">
        <SlidersHorizontal className="size-4" />
        Filtros
      </h2>

      {/* Quita el filtro de categoría/sección (mantiene búsqueda y stock) */}
      <button
        type="button"
        onClick={() => go(buildProductsUrl({ q: query, stock: outOfStock }))}
        className={cn(
          "mb-1 w-full rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors",
          !activeCategory
            ? "bg-secondary text-secondary-foreground"
            : "text-muted-foreground hover:bg-muted"
        )}
      >
        Todas las categorías
      </button>

      <nav className="flex flex-col">
        {CATEGORIES.map((cat) => {
          const isOpen = activeCategory === cat;
          const sections = categorySections[cat];

          return (
            <div key={cat}>
              {/* Al tocar la categoría se filtra por ella y se despliegan sus secciones */}
              <button
                type="button"
                onClick={() =>
                  go(buildProductsUrl({ q: query, category: cat, stock: outOfStock }))
                }
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors",
                  isOpen
                    ? "text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {CATEGORY_LABELS[cat]}
                {isOpen ? (
                  <ChevronDown className="size-4" />
                ) : (
                  <ChevronRight className="size-4" />
                )}
              </button>

              {/* Secciones de la categoría abierta */}
              {isOpen && (
                <div className="ml-2 flex flex-col border-l border-border pl-2">
                  <button
                    type="button"
                    onClick={() =>
                      go(buildProductsUrl({ q: query, category: cat, stock: outOfStock }))
                    }
                    className={cn(
                      "rounded-md px-2 py-1 text-left text-xs transition-colors",
                      !activeSection
                        ? "font-medium text-brand"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Todas
                  </button>
                  {sections.length === 0 ? (
                    <span className="px-2 py-1 text-xs text-muted-foreground/70">
                      Sin secciones
                    </span>
                  ) : (
                    sections.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() =>
                          go(
                            buildProductsUrl({
                              q: query,
                              category: cat,
                              section: s,
                              stock: outOfStock,
                            })
                          )
                        }
                        className={cn(
                          "rounded-md px-2 py-1 text-left text-xs transition-colors",
                          activeSection === s
                            ? "font-medium text-brand"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {s}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
