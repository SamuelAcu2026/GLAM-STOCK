"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, PackageOpen, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFormDialog } from "@/components/products/ProductFormDialog";
import { cn } from "@/lib/utils";
import { buildProductsUrl, type ProductDTO } from "@/lib/products";

const PAGE_SIZE = 24;

type Props = {
  products: ProductDTO[]; // ya vienen filtrados por búsqueda, categoría, sección y stock
  sections: string[]; // para autocompletar el campo sección del formulario
  query: string;
  activeCategory: string;
  activeSection: string;
  outOfStock: boolean;
};

// Grilla de productos: filtra activos/inactivos, pagina de a 24 y abre el modal de
// carga (nuevo) o edición. Búsqueda, categoría, sección y stock se resuelven por URL.
export function ProductGrid({
  products,
  sections,
  query,
  activeCategory,
  activeSection,
  outOfStock,
}: Props) {
  const router = useRouter();
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductDTO | null>(null);

  const filtered = useMemo(
    () => (showInactive ? products : products.filter((p) => p.isActive)),
    [products, showInactive]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Activa/desactiva el filtro de "sin stock" conservando el resto de los filtros.
  function toggleOutOfStock() {
    router.push(
      buildProductsUrl({
        q: query,
        category: activeCategory,
        section: activeSection,
        stock: !outOfStock,
      })
    );
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(product: ProductDTO) {
    setEditing(product);
    setDialogOpen(true);
  }

  const isFiltered = Boolean(query || activeCategory || activeSection || outOfStock);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Productos</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} producto{filtered.length === 1 ? "" : "s"}
            {query && <> para “{query}”</>}
            {outOfStock && <> sin stock</>}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botón para ver solo los productos con stock en 0 */}
          <button
            type="button"
            onClick={toggleOutOfStock}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors",
              outOfStock
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            <PackageX className="size-4" />
            Sin stock
          </button>

          <button
            type="button"
            onClick={() => setShowInactive((v) => !v)}
            className={cn(
              "h-9 rounded-md border px-3 text-sm font-medium transition-colors",
              showInactive
                ? "border-foreground/20 bg-secondary text-secondary-foreground"
                : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            {showInactive ? "Ocultar inactivos" : "Ver inactivos"}
          </button>

          {/* Botón verde para cargar un nuevo producto */}
          <Button
            type="button"
            onClick={openCreate}
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            <Plus className="size-4" />
            Cargar producto
          </Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
          <PackageOpen className="size-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            {isFiltered
              ? "No hay productos que coincidan con el filtro."
              : "Todavía no cargaste ningún producto."}
          </p>
          {!isFiltered && (
            <Button
              type="button"
              onClick={openCreate}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <Plus className="size-4" />
              Cargar el primero
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} onEdit={openEdit} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* key: remonta el form en cada apertura para resetear su estado interno */}
      {dialogOpen && (
        <ProductFormDialog
          key={editing?.id ?? "new"}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          product={editing}
          sections={sections}
        />
      )}
    </div>
  );
}
