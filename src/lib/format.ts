// Formateo de moneda en formato argentino: separador de miles "." y decimales ",".
// Ejemplo: 1500 -> "$ 1.500,00"
const arsFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
});

export function formatARS(value: number): string {
  return arsFormatter.format(value);
}
