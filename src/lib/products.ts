// Tipos y etiquetas compartidos del dominio de productos.
// Este archivo NO importa nada del servidor, así puede usarse tanto en componentes
// de cliente como de servidor sin arrastrar dependencias pesadas.

export const CATEGORIES = ["COSMETICS", "NAILS", "MAKEUP", "TOOLS"] as const;
export type Category = (typeof CATEGORIES)[number];

// Etiquetas en español para mostrar las categorías en la UI.
export const CATEGORY_LABELS: Record<Category, string> = {
  COSMETICS: "Cosmética",
  NAILS: "Uñas",
  MAKEUP: "Maquillaje",
  TOOLS: "Herramientas",
};

// DTO que viaja del servidor al cliente. Los montos van como number (ya convertidos
// desde el Decimal de Prisma) porque los Decimal no son serializables a componentes cliente.
export type ProductDTO = {
  id: string;
  code: string;
  name: string;
  quantity: number;
  imagePath: string | null;
  description: string | null;
  costPrice: number;
  markupPercentage: number | null;
  salePrice: number;
  category: Category;
  section: string | null;
  isActive: boolean;
};

// Construye la URL de /productos con los filtros activos.
// Centralizar esto evita que cada componente pise los parámetros de los otros.
export function buildProductsUrl(params: {
  q?: string;
  category?: string;
  section?: string;
  stock?: boolean;
}): string {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", params.category);
  if (params.section) sp.set("section", params.section);
  if (params.stock) sp.set("stock", "0");
  const qs = sp.toString();
  return qs ? `/productos?${qs}` : "/productos";
}
