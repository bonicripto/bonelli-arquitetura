/* Formatação pt-BR: moeda, datas e meses. */

export function fmtBRL(valorCentavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valorCentavos / 100);
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/** "2026-11-20" ou ISO completo → "2026-11". */
export function monthKeyOf(iso: string): string {
  return iso.slice(0, 7);
}

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  if (!y || !m) return monthKey;
  const d = new Date(y, m - 1, 1);
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(d);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Converte "123,45" / "123.45" / "123" (reais) em centavos. */
export function parseReaisToCentavos(value: string): number | null {
  const cleaned = value.trim().replace(/\./g, "").replace(",", ".");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}
