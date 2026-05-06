export { cn } from "@/lib/utils"

/** Formats COP pesos. E.g. 50000 → "$ 50.000". DEC-08: valores en pesos, no centavos. */
export function formatearPesos(pesos: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(pesos)
}
