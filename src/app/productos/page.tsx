import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductFilters } from "@/components/products/ProductFilters";
import { CATEGORIES, type Category, type ProductDTO } from "@/lib/products";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  section?: string;
  stock?: string;
}>;

// Página de productos. La lectura de datos (dinámica) va dentro de <Suspense> porque
// Next 16 con cacheComponents exige que todo dato no cacheado viva en un boundary.
export default function ProductosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Suspense fallback={<p className="text-muted-foreground">Cargando productos…</p>}>
        <ProductsData searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// Componente async que lee de la base aplicando búsqueda (q), categoría, sección y
// el filtro de stock en 0.
async function ProductsData({ searchParams }: { searchParams: SearchParams }) {
  const { q, category, section, stock } = await searchParams;

  // Solo acepta una categoría válida; cualquier otra cosa se ignora.
  const activeCategory = CATEGORIES.includes(category as Category)
    ? (category as Category)
    : "";
  const outOfStock = stock === "0";

  const products = await prisma.product.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { code: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(activeCategory ? { category: activeCategory } : {}),
      ...(section ? { section } : {}),
      ...(outOfStock ? { quantity: 0 } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  // Mapa categoría -> secciones existentes, para el panel de filtros en acordeón.
  const allRows = await prisma.product.findMany({
    where: { section: { not: null } },
    select: { category: true, section: true },
  });
  const categorySections = {} as Record<Category, string[]>;
  for (const cat of CATEGORIES) categorySections[cat] = [];
  for (const row of allRows) {
    if (row.section && !categorySections[row.category].includes(row.section)) {
      categorySections[row.category].push(row.section);
    }
  }
  for (const cat of CATEGORIES) categorySections[cat].sort();

  const dto: ProductDTO[] = products.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    quantity: p.quantity,
    imagePath: p.imagePath,
    description: p.description,
    costPrice: Number(p.costPrice),
    markupPercentage: p.markupPercentage == null ? null : Number(p.markupPercentage),
    salePrice: Number(p.salePrice),
    category: p.category,
    section: p.section,
    isActive: p.isActive,
  }));

  // Secciones únicas para el autocompletado del formulario (una misma sección puede
  // existir en más de una categoría, así que se deduplica).
  const allSections = [...new Set(CATEGORIES.flatMap((c) => categorySections[c]))].sort();

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Panel de filtros lateral (contenido de la página, NO el menú de navegación) */}
      <aside className="lg:w-60 lg:shrink-0">
        <ProductFilters
          categorySections={categorySections}
          query={q ?? ""}
          activeCategory={activeCategory}
          activeSection={section ?? ""}
          outOfStock={outOfStock}
        />
      </aside>

      <div className="flex-1">
        <ProductGrid
          products={dto}
          sections={allSections}
          query={q ?? ""}
          activeCategory={activeCategory}
          activeSection={section ?? ""}
          outOfStock={outOfStock}
        />
      </div>
    </div>
  );
}
