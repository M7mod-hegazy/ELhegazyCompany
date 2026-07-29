const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/**
 * Formats a number for display in the active locale.
 *
 * Arabic pages use Arabic-Indic digits everywhere — the messages files already
 * hardcode them ("٣ أسئلة بس"), so any number rendered through interpolation has
 * to match or the same component shows two numeral systems at once.
 */
export function formatNum(value: number | string, locale: string): string {
  const s = String(value);
  if (locale !== "ar") return s;
  return s.replace(/[0-9]/g, (d) => ARABIC_DIGITS[Number(d)]);
}

/** Zero-padded ordinal, e.g. 1 → "٠١" (ar) or "01" (en). */
export function formatOrdinal(n: number, locale: string): string {
  return formatNum(String(n).padStart(2, "0"), locale);
}

/**
 * Arabic counts need the dual form and a different word order than English.
 * `2 مشروع` is both the wrong numeral system and grammatically wrong.
 */
export function formatCount(
  n: number,
  locale: string,
  words: { one: string; two: string; few: string; many: string }
): string {
  if (locale !== "ar") return `${n} ${n === 1 ? words.one : words.many}`;
  if (n === 1) return words.one;
  if (n === 2) return words.two;
  if (n >= 3 && n <= 10) return `${formatNum(n, locale)} ${words.few}`;
  return `${formatNum(n, locale)} ${words.many}`;
}
