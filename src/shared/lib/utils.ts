export { cn } from "@/lib/utils"

/** Converts cents (COP) to formatted string. E.g. 150000 → "$1.500" */
export function formatearPesos(centavos: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(centavos / 100)
}
