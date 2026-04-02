/** Rounds nutrition numbers for display (avoids float artifacts like 42.120000000000005). */
export function formatMacro(n: number): string {
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
}
