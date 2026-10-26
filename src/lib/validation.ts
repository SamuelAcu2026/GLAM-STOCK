import { z } from "zod";
import { CATEGORIES } from "@/lib/products";

// Esquema de validación del producto. Se valida en el Server Action (autoritativo),
// no importa lo que haya pasado en el cliente.
export const productInputSchema = z
  .object({
    code: z.string().trim().min(1, "El código es obligatorio"),
    name: z.string().trim().min(1, "El nombre es obligatorio"),
    quantity: z.coerce
      .number()
      .int("La cantidad debe ser un número entero")
      .min(0, "La cantidad no puede ser negativa"),
    description: z.string().trim().optional(),
    category: z.enum(CATEGORIES),
    section: z.string().trim().optional(),
    costPrice: z.coerce.number().min(0, "El costo no puede ser negativo"),
    pricingMode: z.enum(["percentage", "direct"]),
    markupPercentage: z.coerce.number().min(0, "El margen no puede ser negativo").optional(),
    directSalePrice: z.coerce.number().min(0, "El precio no puede ser negativo").optional(),
    imageUrl: z.string().trim().optional(),
  })
  // Regla de negocio: hay que elegir exactamente un modo de precio y completarlo.
  .refine(
    (d) =>
      d.pricingMode === "percentage"
        ? d.markupPercentage != null
        : d.directSalePrice != null,
    {
      message: "Elegí un modo de precio y completá el valor correspondiente",
      path: ["pricingMode"],
    }
  );

export type ProductInput = z.infer<typeof productInputSchema>;
