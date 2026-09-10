"use client";

import { useReducer } from "react";
import { useTranslations, useLocale } from "next-intl";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { getDiagnosticOutcome } from "@/config/diagnostic";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { formatNum } from "@/lib/num";

type ScreenId = "q1" | "branches" | "q2" | "q3";

type Answers = {
  q1: string | null;
  /** Only asked when q1 = "multi". */
  branches: string | null;
  q2: string | null;
  q3: string | null;
};

type State = {
  current: ScreenId | "result";
  answers: Answers;
  /** Screens answered so far, in order — drives the receipt trail, the
      progress count, and back/edit navigation. */
  history: ScreenId[];
};

const initialState: State = {
  current: "q1",
  answers: { q1: null, branches: null, q2: null, q3: null },
  history: [],
};

/** The path branches once: a multi-branch shop gets one extra question
    (how many branches) before the standard problem/next-step pair. */
function nextScreen(justAnswered: ScreenId, answers: Answers): ScreenId | "result" {
  if (justAnswered === "q1") return answers.q1 === "multi" ? "branches" : "q2";
  if (justAnswered === "branches") return "q2";
  if (justAnswered === "q2") return "q3";
  return "result";
}

type Action =
  | { type: "answer"; screen: ScreenId; value: string }
  | { type: "back" }
  /** Jump back to an earlier answer from the receipt trail — re-answering
      it clears it and everything answered after it. */
  | { type: "edit"; screen: ScreenId };

function reducer(state: State, action: Action): State {
  if (action.type === "answer") {
    const answers: Answers = { ...state.answers, [action.screen]: action.value };
    const history = [...state.history, action.screen];
    return { current: nextScreen(action.screen, answers), answers, history };
  }
  if (action.type === "back") {
    if (state.history.length === 0) return state;
    const leaving = state.history[state.history.length - 1];
    const answers: Answers = { ...state.answers, [leaving]: null };
    return { current: leaving, answers, history: state.history.slice(0, -1) };
  }
  // edit
  const idx = state.history.indexOf(action.screen);
  if (idx === -1) return state;
  const answers: Answers = { ...state.answers };
  for (const screen of state.history.slice(idx)) answers[screen] = null;
  return { current: action.screen, answers, history: state.history.slice(0, idx) };
}

const ease = [0.22, 1, 0.36, 1] as const;

type TFn = ReturnType<typeof useTranslations>;
type ScreenConfig = { question: string; options: { label: string; value: string }[] };

/** Q2's wording adapts to Q1's answer, so "what's your biggest problem"
    reads like it was written for that specific situation rather than a
    one-size-fits-all question. The underlying values stay the same
    (numbers/visibility/sellonline/all) — only the labels change — so the
    recommendation rules in diagnostic.ts don't need to know about groups. */
function q2Group(q1: string | null): "shop" | "online" | "none" {
  if (q1 === "online") return "online";
  if (q1 === "none") return "none";
  return "shop";
}

function getScreenConfig(screen: ScreenId, answers: Answers, t: TFn): ScreenConfig {
  if (screen === "q1") {
    return {
      question: t("q1.question"),
      options: [
        { label: t("q1.a1"), value: "1branch" },
        { label: t("q1.a2"), value: "multi" },
        { label: t("q1.a3"), value: "online" },
        { label: t("q1.a4"), value: "none" },
      ],
    };
  }
  if (screen === "branches") {
    return {
      question: t("branches.question"),
      options: [
        { label: t("branches.a1"), value: "2" },
        { label: t("branches.a2"), value: "3to5" },
        { label: t("branches.a3"), value: "6plus" },
      ],
    };
  }
  if (screen === "q2") {
    const group = q2Group(answers.q1);
    return {
      question: t(`q2.${group}.question`),
      options: [
        { label: t(`q2.${group}.a1`), value: "numbers" },
        { label: t(`q2.${group}.a2`), value: "visibility" },
        { label: t(`q2.${group}.a3`), value: "sellonline" },
        { label: t(`q2.${group}.a4`), value: "all" },
      ],
    };
  }
  return {
    question: t("q3.question"),
    options: [
      { label: t("q3.a1"), value: "trial" },
      { label: t("q3.a2"), value: "call" },
      { label: t("q3.a3"), value: "now" },
    ],
  };
}

type Line = { screen: ScreenId; question: string; answer: string };

export function DiagnosticSection() {
  const t = useTranslations("Diagnostic");
  const locale = useLocale();
  const prefersReduced = useReducedMotion();

  const [state, dispatch] = useReducer(reducer, initialState);

  // Total question count is 3 normally, 4 once "multi" pulls the branch-count
  // follow-up into the path — the denominator updates the moment we know.
  const total = state.answers.q1 === "multi" || state.current === "branches" ? 4 : 3;
  const currentIndex = state.history.length;

  const answeredLines: Line[] = state.history.map((screen) => {
    const cfg = getScreenConfig(screen, state.answers, t);
    const chosen = cfg.options.find((o) => o.value === state.answers[screen]);
    return { screen, question: cfg.question, answer: chosen?.label ?? "" };
  });

  return (
    <section
      className="relative isolate overflow-hidden py-24 sm:py-28"
      aria-labelledby="diagnostic-title"
    >
      {/* A soft brass wash grounds the quiz panel — no separate opaque plaster
          layer competing with the shared page-wide atmosphere underneath. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 12% 0%, rgba(201,168,106,0.14) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-4xl px-6">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-brass/80">
          {t("kicker")}
        </p>
        <h2
          id="diagnostic-title"
          className="max-w-[20ch] text-3xl font-semibold leading-[1.15] text-bone sm:text-4xl md:text-5xl"
        >
          {t("title")}
        </h2>
        <p className="mt-4 max-w-[52ch] leading-relaxed text-bone-muted">{t("subtitle")}</p>
        <div className="rule-seal my-8 w-full" />

        {/* Two faint duplicate plies stacked behind the pad — the carbon-copy
            depth cue, built from flat offset panels rather than any shadow
            (the brand runs on hairlines and washes, never blur). */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 translate-x-2 translate-y-2 border border-brass/10 bg-ink-800/30"
          />
          <div
            aria-hidden
            className="absolute inset-0 translate-x-1 translate-y-1 border border-brass/15 bg-ink-800/50"
          />

          <div className="relative min-h-[340px] border border-brass/25 bg-ink-800">
            {/* The running receipt strip — one printed line per answered
                question, editable by clicking back onto its own line. */}
            {answeredLines.length > 0 && state.current !== "result" && (
              <div className="border-b border-dashed border-brass/20 px-6 py-4 sm:px-8">
                <ul className="space-y-1.5">
                  {answeredLines.map((line, i) => (
                    <li key={line.screen}>
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "edit", screen: line.screen })}
                        className="group flex w-full items-baseline gap-3 text-start font-mono text-xs text-bone-muted/80 transition-colors hover:text-brass"
                      >
                        <span className="shrink-0 text-brass/50 group-hover:text-brass">
                          {formatNum(i + 1, locale)}.
                        </span>
                        <span className="min-w-0 flex-1 truncate">{line.question}</span>
                        <span className="shrink-0 text-bone group-hover:text-brass">{line.answer}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div aria-hidden className="receipt-tear -mx-6 -mb-4 mt-4 sm:-mx-8" />
              </div>
            )}

            <div className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {state.current !== "result" ? (
                  <m.div
                    key={state.current}
                    initial={prefersReduced ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReduced ? {} : { opacity: 0, y: -24 }}
                    transition={{ duration: 0.42, ease }}
                  >
                    {/* Progress */}
                    <div className="mb-6 flex items-center gap-3">
                      <p className="font-mono text-xs text-bone-muted">
                        {t("progress", { current: formatNum(currentIndex + 1, locale), total: formatNum(total, locale) })}
                      </p>
                      <div className="flex items-center gap-1.5" aria-hidden>
                        {Array.from({ length: total }).map((_, i) => (
                          <span
                            key={i}
                            className={
                              "seal-round h-1.5 w-1.5 border " +
                              (i <= currentIndex ? "border-brass bg-brass" : "border-brass/30 bg-transparent")
                            }
                          />
                        ))}
                      </div>
                    </div>

                    {/* Question */}
                    <p className="text-xl font-semibold text-bone mb-6">
                      {getScreenConfig(state.current, state.answers, t).question}
                    </p>

                    {/* Answer grid */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {getScreenConfig(state.current, state.answers, t).options.map(({ label, value }, i) => (
                        <m.button
                          key={value}
                          onClick={() => dispatch({ type: "answer", screen: state.current as ScreenId, value })}
                          whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                          className="group flex min-h-[64px] items-center gap-3 border border-brass/20 bg-ink-800 px-5 py-4 text-start text-bone transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brass/60 hover:bg-ink-700 focus-visible:-translate-y-0.5 focus-visible:border-brass"
                        >
                          <span className="seal-round flex h-6 w-6 shrink-0 items-center justify-center border border-brass/30 font-mono text-[11px] text-brass/70 transition-colors group-hover:border-brass group-hover:bg-brass group-hover:text-ink-900">
                            {formatNum(i + 1, locale)}
                          </span>
                          <span className="min-w-0">{label}</span>
                        </m.button>
                      ))}
                    </div>

                    {/* Back button */}
                    {state.history.length > 0 && (
                      <button
                        onClick={() => dispatch({ type: "back" })}
                        className="mt-6 font-mono text-xs text-bone-muted underline-offset-4 hover:text-bone hover:underline"
                      >
                        {/* No arrow glyph: a hardcoded ← points the wrong way in RTL. */}
                        {t("back")}
                      </button>
                    )}
                  </m.div>
                ) : (
                  <DiagnosticResult
                    key="result"
                    answers={state.answers as { q1: string; branches: string | null; q2: string; q3: string }}
                    answeredLines={answeredLines}
                    onBack={() => dispatch({ type: "back" })}
                    t={t}
                    locale={locale}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Result panel ──────────────────────────────────────────────────── */

function DiagnosticResult({
  answers,
  answeredLines,
  onBack,
  t,
  locale,
}: {
  answers: { q1: string; branches: string | null; q2: string; q3: string };
  answeredLines: Line[];
  onBack: () => void;
  t: TFn;
  locale: string;
}) {
  const prefersReduced = useReducedMotion();
  const outcome = getDiagnosticOutcome(answers.q1, answers.q2, answers.q3, answers.branches);
  const ease = [0.22, 1, 0.36, 1] as const;

  const productNames = outcome.products.map((p) => t(`products.${p}`)).join(" + ");

  // Every label below is pulled straight from the printed trail — the
  // WhatsApp message and the itemized receipt both read off the same
  // source, so they can never drift out of sync with each other.
  const lineFor = (screen: ScreenId) => answeredLines.find((l) => l.screen === screen)?.answer ?? "";
  const q1Label = lineFor("q1");
  const branchesLabel = lineFor("branches");
  const q2Label = lineFor("q2");
  const q3Label = lineFor("q3");
  const branchesSuffix = branchesLabel ? ` (${branchesLabel})` : "";

  const wantsTrial = answers.q3 === "trial";

  // A free trial only exists for POS and the online store, and only reads well
  // when there's one clear product to try — not a bundle of two or three.
  const primaryProduct = outcome.products[0];
  const showTrialCta =
    wantsTrial && outcome.products.length === 1 && primaryProduct !== "marketing";
  // They asked for a trial but this outcome has none (marketing, or a bundle) —
  // reframe as a free call instead of quietly falling back to a plain WhatsApp button.
  const showCallCta = wantsTrial && !showTrialCta;

  const waText = t(showCallCta ? "waMessageCall" : "waMessage", {
    q1: q1Label,
    branches: branchesSuffix,
    q2: q2Label,
    q3: q3Label,
    products: productNames,
  });
  const waHref = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(waText)}`;

  // Primary product page
  const productHref =
    primaryProduct === "pos" ? "/products/pos" :
    primaryProduct === "ecommerce" ? "/products/ecommerce" :
    "/services/marketing";

  const trialHref = `${productHref}#pricing`;

  return (
    <m.div
      initial={prefersReduced ? false : { opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={prefersReduced ? {} : { opacity: 0 }}
      transition={{ duration: 0.42, ease }}
    >
      {/* Seal stamp border */}
      <div className="relative border border-brass/30 bg-ink-800 p-8">
        {/* Decorative seal at top-center */}
        <div aria-hidden className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="seal-round flex h-8 w-8 items-center justify-center border border-brass bg-ink-900">
            <span className="seal-round h-3 w-3 border border-brass" />
          </span>
        </div>

        <p className="font-mono text-xs uppercase tracking-[0.25em] text-bone-muted mb-3">
          {t("resultTitle")}
        </p>
        <p className="text-2xl font-semibold text-bone mb-6">{productNames}</p>

        {/* The answers, itemized like the tally on a receipt — the price
            below isn't a black box, it's the sum of these lines. */}
        <ul className="space-y-1.5 border-t border-dashed border-brass/20 pt-5">
          {answeredLines.map((line) => (
            <li
              key={line.screen}
              className="flex items-baseline gap-3 font-mono text-xs text-bone-muted"
            >
              <span className="min-w-0 flex-1 truncate">{line.question}</span>
              <span className="shrink-0 text-bone">{line.answer}</span>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-2 gap-4 border-t border-brass/10 pt-5 mt-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-bone-muted mb-1">
              {t("priceLabel")}
            </p>
            <p className="font-mono text-lg text-brass">
              {t("priceValue", {
                from: formatNum(outcome.priceFromEGP.toLocaleString("en-US"), locale),
                to: formatNum(outcome.priceToEGP.toLocaleString("en-US"), locale),
              })}
            </p>
            {outcome.multiBranch && (
              <p className="mt-1.5 max-w-[26ch] font-mono text-[11px] leading-relaxed text-bone-muted/70">
                {t("multiBranchNote")}
              </p>
            )}
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-bone-muted mb-1">
              {t("durationLabel")}
            </p>
            <p className="font-mono text-lg text-brass">
              {t("durationValue", {
                min: formatNum(outcome.weeksMin, locale),
                max: formatNum(outcome.weeksMax, locale),
              })}
            </p>
          </div>
        </div>

        {/* Actions — a stated trial preference is the primary action when the
            outcome supports it; otherwise the reframed call CTA leads instead
            of silently handing back a generic WhatsApp button. */}
        <div className="mt-8 flex flex-wrap gap-4">
          {showTrialCta && (
            <Link
              href={trialHref}
              className="bg-brass px-6 py-3 font-mono text-sm font-semibold text-ink-900 transition-opacity hover:opacity-90"
            >
              {t("ctaTrial", { product: productNames })}
            </Link>
          )}
          {/* WhatsApp — must be a real <a>, not window.open. iOS blocks the latter. */}
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className={
              showTrialCta
                ? "border border-brass/30 px-6 py-3 font-mono text-sm text-bone transition-colors hover:border-brass/60"
                : "bg-brass px-6 py-3 font-mono text-sm font-semibold text-ink-900 transition-opacity hover:opacity-90"
            }
          >
            {showCallCta ? t("ctaCall") : t("ctaWhatsapp")}
          </a>
          <Link
            href={productHref}
            className="border border-brass/30 px-6 py-3 font-mono text-sm text-bone transition-colors hover:border-brass/60"
          >
            {t("ctaProduct")}
          </Link>
        </div>
      </div>

      <button
        onClick={onBack}
        className="mt-4 font-mono text-xs text-bone-muted underline-offset-4 hover:text-bone hover:underline"
      >
        {t("back")}
      </button>
    </m.div>
  );
}
