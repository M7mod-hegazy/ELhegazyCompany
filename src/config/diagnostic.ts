/**
 * Diagnostic recommendation engine — pure data.
 *
 * The owner can edit price and duration values here without touching any
 * component code. Each entry is marked with OWNER: edit.
 *
 * Rules keyed by "${q1}-${q2}-${q3}". Use "*" as a wildcard for any position.
 * Rules are evaluated in order; the first match wins.
 */

export type DiagnosticOutcome = {
  id: string;
  products: ("pos" | "ecommerce" | "marketing")[];
  priceFromEGP: number;   // OWNER: edit
  priceToEGP: number;     // OWNER: edit
  weeksMin: number;       // OWNER: edit
  weeksMax: number;       // OWNER: edit
};

export const diagnosticOutcomes: Record<string, DiagnosticOutcome> = {
  "pos-only": {
    id: "pos-only",
    products: ["pos"],
    priceFromEGP: 8000,    // OWNER: edit
    priceToEGP: 15000,     // OWNER: edit
    weeksMin: 1,           // OWNER: edit
    weeksMax: 2,           // OWNER: edit
  },
  "ecommerce-only": {
    id: "ecommerce-only",
    products: ["ecommerce"],
    priceFromEGP: 15000,   // OWNER: edit
    priceToEGP: 30000,     // OWNER: edit
    weeksMin: 3,           // OWNER: edit
    weeksMax: 6,           // OWNER: edit
  },
  "marketing-only": {
    id: "marketing-only",
    products: ["marketing"],
    priceFromEGP: 5000,    // OWNER: edit
    priceToEGP: 15000,     // OWNER: edit
    weeksMin: 1,           // OWNER: edit
    weeksMax: 2,           // OWNER: edit
  },
  "pos-marketing": {
    id: "pos-marketing",
    products: ["pos", "marketing"],
    priceFromEGP: 12000,   // OWNER: edit
    priceToEGP: 25000,     // OWNER: edit
    weeksMin: 2,           // OWNER: edit
    weeksMax: 4,           // OWNER: edit
  },
  "ecommerce-marketing": {
    id: "ecommerce-marketing",
    products: ["ecommerce", "marketing"],
    priceFromEGP: 18000,   // OWNER: edit
    priceToEGP: 40000,     // OWNER: edit
    weeksMin: 4,           // OWNER: edit
    weeksMax: 8,           // OWNER: edit
  },
  "all": {
    id: "all",
    products: ["pos", "ecommerce", "marketing"],
    priceFromEGP: 25000,   // OWNER: edit
    priceToEGP: 55000,     // OWNER: edit
    weeksMin: 6,           // OWNER: edit
    weeksMax: 12,          // OWNER: edit
  },
};

/**
 * Rule table. First match wins. "*" = any answer.
 *
 * Q1: shop situation — "1branch" | "multi" | "online" | "none"
 * Q2: biggest problem — "numbers" | "visibility" | "sellonline" | "all"
 * Q3: timing — "thismonth" | "3months" | "exploring"
 */
export const diagnosticRules: { match: string; outcome: string }[] = [
  // "All of them" → full suite regardless of other answers
  { match: "*-all-*",          outcome: "all" },

  // Has a physical shop + can't sell online → POS + ecommerce
  { match: "1branch-sellonline-*",  outcome: "ecommerce-marketing" },
  { match: "multi-sellonline-*",    outcome: "ecommerce-marketing" },

  // Has a physical shop + numbers problem → POS first
  { match: "1branch-numbers-*",    outcome: "pos-only" },
  { match: "multi-numbers-*",      outcome: "pos-only" },

  // Has a physical shop + visibility problem → marketing
  { match: "1branch-visibility-*", outcome: "pos-marketing" },
  { match: "multi-visibility-*",   outcome: "pos-marketing" },

  // Online only → ecommerce + marketing
  { match: "online-*-*",           outcome: "ecommerce-marketing" },

  // Nothing yet + exploring → start with marketing
  { match: "none-*-exploring",     outcome: "marketing-only" },

  // Nothing yet + urgent → full plan
  { match: "none-*-thismonth",     outcome: "all" },
  { match: "none-*-3months",       outcome: "all" },

  // Fallback
  { match: "*-*-*",                outcome: "marketing-only" },
];

export function getDiagnosticOutcome(
  q1: string,
  q2: string,
  q3: string
): DiagnosticOutcome {
  const key = `${q1}-${q2}-${q3}`;
  for (const rule of diagnosticRules) {
    if (matchesRule(rule.match, key)) {
      return diagnosticOutcomes[rule.outcome] ?? diagnosticOutcomes["marketing-only"];
    }
  }
  return diagnosticOutcomes["marketing-only"];
}

function matchesRule(pattern: string, key: string): boolean {
  const patParts = pattern.split("-");
  const keyParts = key.split("-");
  if (patParts.length !== keyParts.length) return false;
  return patParts.every((p, i) => p === "*" || p === keyParts[i]);
}
