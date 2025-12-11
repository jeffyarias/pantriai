// utils/dateUtils.ts
//------------------------------------------------------------
// UNIVERSAL DATE EXTRACTOR FOR OCR (WORKS WITH ALL FORMATS)
//------------------------------------------------------------

export function extractDates(text: string): string[] {
  if (!text) return [];

  // 1️⃣ CLEAN / NORMALIZE OCR TEXT
  const cleaned = text
    .replace(/[•|_]/g, "/")     // Convert weird symbols
    .replace(/[,;]/g, " ")      // Commas can break detection
    .replace(/\s+/g, " ")       // Normalize spacing
    .trim()
    .toLowerCase();

  // 2️⃣ REGEX PATTERNS (MANY FORMATS)
  const patterns = [
    /\b\d{1,2}[-/\s.]\d{1,2}[-/\s.]\d{2,4}\b/gi,     // 08/20/2026 | 8-20-26 | 8 20 2026
    /\b\d{4}[-/\s.]\d{1,2}[-/\s.]\d{1,2}\b/gi,       // 2026/08/20 | 2026-8-20
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s?\d{1,2}\s?\d{2,4}\b/gi, // aug 20 2026
    /\b\d{1,2}\s?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s?\d{2,4}\b/gi,  // 20 aug 26
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s?\d{4}\b/gi,              // aug 2026
  ];

  const rawMatches = new Set<string>();

  // 3️⃣ COLLECT ALL MATCHES
  for (const regex of patterns) {
    const found = cleaned.match(regex);
    if (found) found.forEach((m) => rawMatches.add(m.trim()));
  }

  if (rawMatches.size === 0) return [];

  // 4️⃣ NORMALIZE MATCHES → YYYY-MM-DD
  const results: string[] = [];

  rawMatches.forEach(raw => {
    const normalized = tryNormalizeDate(raw);
    if (normalized) results.push(normalized);
  });

  return results;
}



//------------------------------------------------------------
// NORMALIZATION LOGIC: SMART DATE CONVERSION
//------------------------------------------------------------
function tryNormalizeDate(raw: string): string | null {
  try {
    const monthNames: Record<string, string> = {
      jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
      jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
    };

    let r = raw.toLowerCase();

    // Convert month names → numeric
    for (const m in monthNames) {
      const regex = new RegExp(m + "[a-z]*", "gi");
      r = r.replace(regex, monthNames[m]);
    }

    // Remove any leftover non-date symbols
    r = r.replace(/[^0-9\/\-. ]/g, " ");
    r = r.replace(/\s+/g, " ").trim();

    const parts = r.split(/[-/. ]/).filter(Boolean);

    // ⚡ Case 1: DD MM YYYY or MM DD YYYY or YYYY MM DD
    if (parts.length === 3) {
      let [a, b, c] = parts.map(p => p.padStart(2, "0"));

      // Year-first
      if (a.length === 4) return `${a}-${b}-${c}`;

      // Year-last
      if (c.length === 4) return `${c}-${a}-${b}`;

      // Two-digit year → assume 20xx
      return `20${c}-${a}-${b}`;
    }

    // ⚡ Case 2: Month + Year only (e.g. "aug 2026")
    if (parts.length === 2) {
      const [month, year] = parts;
      if (month.length === 2 && year.length === 4) {
        return `${year}-${month}-01`;
      }
    }

    return null;
  } catch {
    return null;
  }
}
