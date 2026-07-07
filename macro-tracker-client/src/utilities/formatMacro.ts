export function formatMacro(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "0";
  }
  return String(Number(value.toFixed(1)));
}
