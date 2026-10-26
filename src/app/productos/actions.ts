"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { productInputSchema } from "@/lib/validation";
import { computeSalePrice } from "@/lib/pricing";
import { saveProductImage } from "@/lib/image";

// Verifica que haya sesión antes de cualquier mutación. Doble candado junto al middleware:
// aunque alguien llame al Server Action directamente, sin sesión no pasa.
async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("No autorizado");
}

// Estado que devuelve el guardado al formulario (lo consume useActionState en el cliente).
export type SaveState = { ok: boolean; error?: string };

// Server Action: crea o actualiza un producto según venga o no un "id" en el FormData.
// Valida con zod, procesa la imagen, calcula el precio de venta y persiste con Prisma.
export async function saveProduct(
  _prev: SaveState,
  formData: FormData
): Promise<SaveState> {
  await requireAuth();
  const id = (formData.get("id") as string) || null;
  // Estado activo/inactivo del formulario (por defecto activo al cargar uno nuevo).
  const isActive = formData.get("isActive") !== "false";

  const parsed = productInputSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    quantity: formData.get("quantity"),
    description: formData.get("description") ?? undefined,
    category: formData.get("category"),
    section: formData.get("section") ?? undefined,
    costPrice: formData.get("costPrice"),
    pricingMode: formData.get("pricingMode"),
    markupPercentage: formData.get("markupPercentage") || undefined,
    directSalePrice: formData.get("directSalePrice") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;

  // Precio de venta: se materializa al guardar (ver lib/pricing.ts).
  const { salePrice, markupPercentage } = computeSalePrice({
    costPrice: data.costPrice,
    pricingMode: data.pricingMode,
    markupPercentage: data.markupPercentage ?? null,
    directSalePrice: data.directSalePrice ?? null,
  });

  // Imagen: el archivo subido tiene prioridad; si no hay, se usa la URL pegada.
  // undefined = no tocar la imagen existente (importante al editar).
  const file = formData.get("imageFile") as File | null;
  let imagePath: string | null | undefined;
  if (file && file.size > 0) {
    imagePath = await saveProductImage(file);
  } else if (data.imageUrl) {
    imagePath = data.imageUrl;
  } else if (!id) {
    imagePath = null;
  }

  try {
    if (id) {
      await prisma.product.update({
        where: { id },
        data: {
          code: data.code,
          name: data.name,
          quantity: data.quantity,
          description: data.description || null,
          category: data.category,
          section: data.section || null,
          costPrice: data.costPrice,
          markupPercentage,
          salePrice,
          isActive,
          ...(imagePath !== undefined ? { imagePath } : {}),
        },
      });
    } else {
      await prisma.product.create({
        data: {
          code: data.code,
          name: data.name,
          quantity: data.quantity,
          description: data.description || null,
          category: data.category,
          section: data.section || null,
          costPrice: data.costPrice,
          markupPercentage,
          salePrice,
          isActive,
          imagePath: imagePath ?? null,
        },
      });
    }
  } catch (e: unknown) {
    // P2002 = violación de índice único (código repetido).
    if (typeof e === "object" && e !== null && (e as { code?: string }).code === "P2002") {
      return { ok: false, error: `Ya existe un producto con el código "${data.code}"` };
    }
    return { ok: false, error: "No se pudo guardar el producto" };
  }

  // Refresca la grilla (Server Component) con los datos nuevos.
  revalidatePath("/productos");
  return { ok: true };
}

// Server Action: ajusta el stock sumando o restando (delta +1 / -1 desde la card).
// Nunca deja el stock por debajo de 0; así se descuenta al vender un insumo.
export async function adjustStock(id: string, delta: number): Promise<void> {
  await requireAuth();
  const current = await prisma.product.findUnique({
    where: { id },
    select: { quantity: true },
  });
  if (!current) return;

  const next = Math.max(0, current.quantity + delta);
  if (next === current.quantity) return;

  await prisma.product.update({ where: { id }, data: { quantity: next } });
  revalidatePath("/productos");
}

// Server Action: alterna el estado activo/inactivo de un producto (reemplaza al borrado).
export async function toggleProductActive(id: string): Promise<void> {
  await requireAuth();
  const current = await prisma.product.findUnique({
    where: { id },
    select: { isActive: true },
  });
  if (!current) return;

  await prisma.product.update({
    where: { id },
    data: { isActive: !current.isActive },
  });
  revalidatePath("/productos");
}
