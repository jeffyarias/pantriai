// utils/dateUtils.ts

//------------------------------------------------------------
// UNIVERSAL DATE EXTRACTOR FOR OCR TEXT
// Handles:
//  - 08/05/26, 08-05-2026, 2026/08/05
//  - AUG 07 26, OCT 14 2026
//  - "BEST BEFORE / BEST BY / BEST IF USED BY ..."
//  - Fuzzy month like "DCT" -> "OCT"
//  - 5-digit Julian codes like 26144
//------------------------------------------------------------

export function extractDates(text: string): string[] {
  if (!text) return [];

  // 1️⃣ CLEANING: make OCR text easier to parse
  const cleaned = text
    .replace(/[•|_]/g, "/")
    .replace(/[,;]/g, " ")
    // split letters and digits: "26L141" -> "26 L141"
    .replace(/([0-9])([A-Za-z])/g, '$1 $2')
    .replace(/([A-Za-z])([0-9])/g, '$1 $2')
    .replace(/\s+/g, " ")
    .trim();

  const lower = cleaned.toLowerCase();
  const upper = cleaned.toUpperCase();

  const results = new Set<string>();

  // 2️⃣ NUMERIC & MONTH-NAME PATTERNS
  const patterns: RegExp[] = [
    /\b\d{1,2}[-/\s.]\d{1,2}[-/\s.]\d{2,4}\b/gi, // 08/05/26, 8-5-2026, 8 5 26
    /\b\d{4}[-/\s.]\d{1,2}[-/\s.]\d{1,2}\b/gi,   // 2026/08/05
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s?\d{1,2}\s?\d{2,4}\b/gi, // aug 7 26
    /\b\d{1,2}\s?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s?\d{2,4}\b/gi,  // 7 aug 26
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s?\d{4}\b/gi,              // aug 2026
  ];

  for (const re of patterns) {
    const matches = lower.match(re);
    if (matches) {
      for (const m of matches) {
        const norm = tryNormalizeDate(m);
        if (norm) results.add(norm);
      }
    }
  }

  // 3️⃣ "BEST BY / BEST BEFORE / BEST IF USED BY ..." with fuzzy month
  const bestByDates = extractBestByDate(upper);
  bestByDates.forEach((d) => results.add(d));

  // 4️⃣ 5-digit Julian codes like 26144 → 2026-05-24
  const julianDates = parseJulianCodes(upper);
  julianDates.forEach((d) => results.add(d));

  return Array.from(results);
}

//------------------------------------------------------------
// Helpers
//------------------------------------------------------------

const MONTHS: Record<string, string> = {
  JAN: "01",
  FEB: "02",
  MAR: "03",
  APR: "04",
  MAY: "05",
  JUN: "06",
  JUL: "07",
  AUG: "08",
  SEP: "09",
  SEPT: "09",
  OCT: "10",
  NOV: "11",
  DEC: "12",
};

// fuzzy "DCT" -> "OCT" etc.
function fuzzyMonth(token: string): string | null {
  const clean = token.toUpperCase().replace(/[^A-Z]/g, "");
  if (MONTHS[clean]) return MONTHS[clean];

  if (clean.length !== 3) return null;

  let bestKey: string | null = null;
  let bestDiff = 10;

  for (const key of Object.keys(MONTHS)) {
    if (key.length !== 3) continue;
    let diff = 0;
    for (let i = 0; i < 3; i++) {
      if (clean[i] !== key[i]) diff++;
    }
    if (diff < bestDiff) {
      bestDiff = diff;
      bestKey = key;
    }
  }

  if (bestKey && bestDiff <= 1) {
    return MONTHS[bestKey];
  }
  return null;
}

// "BEST BY OCT 14 2026", "BEST BEFORE AUG 07 26", etc.
function extractBestByDate(upper: string): string[] {
  const results: string[] = [];

  const re =
    /\bBEST\s+(?:IF\s+USED\s+BY|BY|BEFORE)\s+([A-Z]{2,4})\s+(\d{1,2})\s+(\d{2,4})\b/g;

  let m: RegExpExecArray | null;
  while ((m = re.exec(upper)) !== null) {
    const [, monthToken, dayToken, yearToken] = m;
    const month = fuzzyMonth(monthToken);
    const day = dayToken.replace(/\D/g, "");
    let year = yearToken.replace(/\D/g, "");

    if (!month || !day || !year) continue;

    if (year.length === 2) {
      // assume 20xx for 2-digit years like 26
      year = "20" + year;
    }

    if (year.length !== 4) continue;

    const iso = `${year}-${month}-${day.padStart(2, "0")}`;
    results.push(iso);
  }

  return results;
}

// Normalize simple numeric / month-name formats
function tryNormalizeDate(raw: string): string | null {
  try {
    const monthNames: Record<string, string> = {
      jan: "01",
      feb: "02",
      mar: "03",
      apr: "04",
      may: "05",
      jun: "06",
      jul: "07",
      aug: "08",
      sep: "09",
      oct: "10",
      nov: "11",
      dec: "12",
    };

    let r = raw.toLowerCase();

    for (const m in monthNames) {
      const regex = new RegExp(m + "[a-z]*", "gi");
      r = r.replace(regex, monthNames[m]);
    }

    r = r.replace(/[^0-9\/\-. ]/g, " ");
    r = r.replace(/\s+/g, " ").trim();

    const parts = r.split(/[-/. ]/).filter(Boolean);

    if (parts.length === 3) {
      let [a, b, c] = parts.map((p) => p.padStart(2, "0"));

      // yyyy-mm-dd
      if (a.length === 4) return `${a}-${b}-${c}`;

      // dd-mm-yyyy or mm-dd-yyyy
      if (c.length === 4) return `${c}-${a}-${b}`;

      // two-digit year, assume 20xx
      return `20${c}-${a}-${b}`;
    }

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

// 5-digit Julian codes like 26144 → 2026-05-24
function parseJulianCodes(upper: string): string[] {
  const matches = upper.match(/\b\d{5}\b/g);
  if (!matches) return [];

  const results: string[] = [];

  for (const code of matches) {
    const yearDigit = parseInt(code[0], 10);
    const dayOfYear = parseInt(code.slice(1), 10);

    if (
      Number.isNaN(yearDigit) ||
      Number.isNaN(dayOfYear) ||
      dayOfYear < 1 ||
      dayOfYear > 366
    ) {
      continue;
    }

    const year = 2020 + yearDigit; // adjust base if needed
    const date = new Date(year, 0); // Jan 1
    date.setDate(dayOfYear);

    const iso = date.toISOString().slice(0, 10);
    results.push(iso);
  }

  return results;
}
