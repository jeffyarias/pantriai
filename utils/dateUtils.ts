export function extractDates(strings: string[]): string[] {
  return strings
    .map((s) => normalizeDate(s))
    .filter((v): v is string => !!v);
}

export function normalizeDate(raw: string): string | null {
  const cleaned = raw.replace(/[.\-]/g, '/');
  const parts = cleaned.split('/');
  if (parts.length < 2) return null;

  let [m, d, y] = parts.map((x) => parseInt(x, 10));
  if (!Number.isFinite(m)) return null;
  if (!Number.isFinite(d)) d = 1;
  if (Number.isFinite(y) && y < 100) y += 2000;
  if (!Number.isFinite(y)) return null;

  const date = new Date(y, m - 1, d);
  const now = new Date();
  if (!(date instanceof Date) || isNaN(date.valueOf())) return null;
  if (date < now || date > new Date('2035-01-01')) return null;

  return date.toISOString().slice(0, 10);
}
