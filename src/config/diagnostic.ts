/**
 * Diagnostic recommendation engine — pure data.
 *
 * The owner can edit price and duration values here without touching any
 * component code. Each entry is marked with OWNER: edit.
 *
 * Rules keyed by "${q1}-${q2}-${q3}". Use "*" as a wildcard for any position.
 * Rules are evaluated in order; the first match wins.
 *
 * Q3 ("what do you want to do now") only ever picks the CTA style in the
 * result panel — it must never change which product gets recommended. A
 * rule table that let "I want a free trial" downgrade someone to a product
 * with no trial was the original bug here; product fit is Q1 × Q2 only.
 *
 * "branches" is a follow-up asked only when Q1 = "multi" — it doesn't
 * change *what* gets recommended, only the POS price (multi-branch stock
 * transfer and per-branch reporting scale with branch count).
 */

export type DiagnosticOutcome = {
  id: string;
  products: ("pos" | "ecommerce" | "marketing")[];
  priceFromEGP: number;   // OWNER: edit
  priceToEGP: number;     // OWNER: edit
  weeksMin: number;       // OWNER: edit
  weeksMax: number;       // OWNER: edit
  /** Set at read time (not here) when a multi-branch surcharge was applied. */
  multiBranch?: boolean;
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
  "pos-ecommerce": {
    id: "pos-ecommerce",
    products: ["pos", "ecommerce"],
    priceFromEGP: 20000,   // OWNER: edit
    priceToEGP: 40000,     // OWNER: edit
    weeksMin: 3,           // OWNER: edit
    weeksMax: 6,           // OWNER: edit
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
 * Multi-branch surcharge, applied once (per tier, not per exact branch —
 * the quiz only captures a band). 5,000 EGP per branch beyond the first,
 * banded into three tiers so the quiz doesn't need a numeric input.
 */
export const BRANCH_COUNT_VALUES = ["2", "3to5", "6plus"] as const;

const MULTI_BRANCH_SURCHARGE_EGP: Record<string, number> = {
  "2": 5000,      // OWNER: edit — 1 extra branch @ 5,000
  "3to5": 15000,  // OWNER: edit — ~3 extra branches @ 5,000
  "6plus": 30000, // OWNER: edit — starting point; exact count is priced on the call
};

/**
 * Rule table. First match wins. "*" = any answer.
 *
 * Q1: shop situation — "1branch" | "multi" | "online" | "none"
 * Q2: biggest problem — "numbers" | "visibility" | "sellonline" | "all"
 * Q3: next step — "trial" (try it free first) | "call" (talk it through) | "now" (start immediately)
 */
export const diagnosticRules: { match: string; outcome: string }[] = [
  // "All of them" → full suite regardless of other answers
  { match: "*-all-*",          outcome: "all" },

  // Has a physical shop + can't sell online → ecommerce + marketing
  { match: "1branch-sellonline-*",  outcome: "ecommerce-marketing" },
  { match: "multi-sellonline-*",    outcome: "ecommerce-marketing" },

  // Has a physical shop + numbers problem → POS first
  { match: "1branch-numbers-*",    outcome: "pos-only" },
  { match: "multi-numbers-*",      outcome: "pos-only" },

  // Has a physical shop + visibility problem → marketing
  { match: "1branch-visibility-*", outcome: "pos-marketing" },
  { match: "multi-visibility-*",   outcome: "pos-marketing" },

  // Already sells online but can't read the numbers → they need POS-grade
  // reporting bolted onto the store, not more marketing spend.
  { match: "online-numbers-*",     outcome: "pos-ecommerce" },
  // Already sells online, but orders get lost/delayed → the store itself
  // needs work, not a marketing budget on top of a leaky checkout.
  { match: "online-sellonline-*",  outcome: "ecommerce-only" },
  // Online only, remaining case (visibility) → ecommerce + marketing
  { match: "online-*-*",           outcome: "ecommerce-marketing" },

  // Hasn't started yet → match the specific pain they named. Pushing the
  // full suite on everyone here regardless of what they said isn't honest
  // and doesn't match the "quick, no BS" promise in the subtitle copy.
  { match: "none-numbers-*",       outcome: "pos-only" },
  { match: "none-visibility-*",    outcome: "marketing-only" },
  { match: "none-sellonline-*",    outcome: "ecommerce-only" },

  // Fallback
  { match: "*-*-*",                outcome: "marketing-only" },
];

export function getDiagnosticOutcome(
  q1: string,
  q2: string,
  q3: string,
  branches?: string | null
): DiagnosticOutcome {
  const key = `${q1}-${q2}-${q3}`;
  const rule = diagnosticRules.find((r) => matchesRule(r.match, key));
  const outcome = diagnosticOutcomes[rule?.outcome ?? "marketing-only"] ?? diagnosticOutcomes["marketing-only"];
  return applyMultiBranchSurcharge(outcome, q1, branches);
}

function applyMultiBranchSurcharge(
  outcome: DiagnosticOutcome,
  q1: string,
  branches?: string | null
): DiagnosticOutcome {
  // The surcharge only makes sense on the POS line — multi-branch stock
  // transfer and per-branch reporting are POS scope, not ecommerce/marketing.
  if (q1 !== "multi" || !outcome.products.includes("pos")) return outcome;
  const surcharge = MULTI_BRANCH_SURCHARGE_EGP[branches ?? "2"] ?? MULTI_BRANCH_SURCHARGE_EGP["2"];
  return {
    ...outcome,
    priceFromEGP: outcome.priceFromEGP + surcharge,
    priceToEGP: outcome.priceToEGP + surcharge,
    multiBranch: true,
  };
}

function matchesRule(pattern: string, key: string): boolean {
  const patParts = pattern.split("-");
  const keyParts = key.split("-");
  if (patParts.length !== keyParts.length) return false;
  return patParts.every((p, i) => p === "*" || p === keyParts[i]);
}
