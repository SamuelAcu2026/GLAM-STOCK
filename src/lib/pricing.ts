// Lógica de precios: única fuente de verdad para calcular el precio de venta.
// La usan tanto el formulario (preview en vivo) como el Server Action al guardar,
// así la cuenta nunca queda duplicada ni desincronizada.

export type PricingMode = "percentage" | "direct";

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Calcula el precio de venta a partir del costo y el modo elegido.
// - "percentage": aplica el margen sobre el costo -> costo * (1 + margen/100)
// - "direct": usa el precio de venta que cargó el usuario tal cual
export function computeSalePrice(params: {
  costPrice: number;
  pricingMode: PricingMode;
  markupPercentage?: number | null;
  directSalePrice?: number | null;
}): { salePrice: number; markupPercentage: number | null } {
  const { costPrice, pricingMode, markupPercentage, directSalePrice } = params;

  if (pricingMode === "percentage") {
    if (markupPercentage == null || Number.isNaN(markupPercentage)) {
      throw new Error("Falta el porcentaje de margen");
    }
    return {
      salePrice: round2(costPrice * (1 + markupPercentage / 100)),
      markupPercentage,
    };
  }

  if (directSalePrice == null || Number.isNaN(directSalePrice)) {
    throw new Error("Falta el precio de venta");
  }
  return { salePrice: round2(directSalePrice), markupPercentage: null };
}
