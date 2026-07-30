"use client";

import { useReducer } from "react";
import { useTranslations, useLocale } from "next-intl";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { getDiagnosticOutcome } from "@/config/diagnostic";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { formatNum } from "@/lib/num";

const Q1_VALUES = ["1branch", "multi", "online", "none"] as const;
const Q2_VALUES = ["numbers", "visibility", "sellonline", "all"] as const;
const Q3_VALUES = ["trial", "call", "now"] as const;

type State =
  | { step: 0; q1: null; q2: null; q3: null }
  | { step: 1; q1: string; q2: null; q3: null }
  | { step: 2; q1: string; q2: string; q3: null }
  | { step: 3; q1: string; q2: string; q3: string };

type Action =
  | { type: "answer"; value: string }
  | { type: "back" };

function reducer(state: State, action: Action): State {
  if (action.type === "back") {
    if (state.step === 1) return { step: 0, q1: null, q2: null, q3: null };
    if (state.step === 2) return { step: 1, q1: state.q1, q2: null, q3: null };
    if (state.step === 3) return { step: 2, q1: state.q1, q2: state.q2, q3: null };
    return state;
  }
  if (state.step === 0) return { step: 1, q1: action.value, q2: null, q3: null };
  if (state.step === 1) return { step: 2, q1: state.q1, q2: action.value, q3: null };
  if (state.step === 2) return { step: 3, q1: state.q1, q2: state.q2, q3: action.value };
  return state;
}

const ease = [0.22, 1, 0.36, 1] as const;

export function DiagnosticSection() {
  const t = useTranslations("Diagnostic");
  const locale = useLocale();
  const prefersReduced = useReducedMotion();

  const [state, dispatch] = useReducer(reducer, { step: 0, q1: null, q2: null, q3: null });
  const totalSteps = 3;

  const questions = [
    {
      key: "q1",
      question: t("q1.question"),
      answers: [
        { label: t("q1.a1"), value: Q1_VALUES[0] },
        { label: t("q1.a2"), value: Q1_VALUES[1] },
        { label: t("q1.a3"), value: Q1_VALUES[2] },
        { label: t("q1.a4"), value: Q1_VALUES[3] },
      ],
    },
    {
      key: "q2",
      question: t("q2.question"),
      answers: [
        { label: t("q2.a1"), value: Q2_VALUES[0] },
        { label: t("q2.a2"), value: Q2_VALUES[1] },
        { label: t("q2.a3"), value: Q2_VALUES[2] },
        { label: t("q2.a4"), value: Q2_VALUES[3] },
      ],
    },
    {
      key: "q3",
      question: t("q3.question"),
      answers: [
        { label: t("q3.a1"), value: Q3_VALUES[0] },
        { label: t("q3.a2"), value: Q3_VALUES[1] },
        { label: t("q3.a3"), value: Q3_VALUES[2] },
      ],
    },
  ];

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

        <div className="min-h-[340px] border border-brass/15 bg-ink-900/70 p-6 sm:p-8">
        <AnimatePresence mode="wait">
          {state.step < 3 ? (
            <m.div
              key={`q${state.step}`}
              initial={prefersReduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReduced ? {} : { opacity: 0, y: -24 }}
              transition={{ duration: 0.42, ease }}
            >
              {/* Progress */}
              <p className="font-mono text-xs text-bone-muted mb-6">
                {t("progress", { current: formatNum(state.step + 1, locale), total: formatNum(totalSteps, locale) })}
              </p>

              {/* Question */}
              <p className="text-xl font-semibold text-bone mb-6">
                {questions[state.step].question}
              </p>

              {/* Answer grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {questions[state.step].answers.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => dispatch({ type: "answer", value })}
                    className="min-h-[64px] border border-brass/20 bg-ink-800 px-5 py-4 text-start text-bone transition-colors hover:border-brass/60 hover:bg-ink-700 focus-visible:border-brass"
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Back button */}
              {state.step > 0 && (
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
              state={state as { step: 3; q1: string; q2: string; q3: string }}
              onBack={() => dispatch({ type: "back" })}
              t={t}
              locale={locale}
            />
          )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ── Result panel ──────────────────────────────────────────────────── */
type ResultState = { step: 3; q1: string; q2: string; q3: string };
type TFn = ReturnType<typeof useTranslations>;

function DiagnosticResult({
  state,
  onBack,
  t,
  locale,
}: {
  state: ResultState;
  onBack: () => void;
  t: TFn;
  locale: string;
}) {
  const prefersReduced = useReducedMotion();
  const outcome = getDiagnosticOutcome(state.q1, state.q2, state.q3);
  const ease = [0.22, 1, 0.36, 1] as const;

  const productNames = outcome.products.map((p) => t(`products.${p}`)).join(" + ");

  // Build WhatsApp URL
  const q1Label = (
    state.q1 === "1branch" ? t("q1.a1") :
    state.q1 === "multi"    ? t("q1.a2") :
    state.q1 === "online"   ? t("q1.a3") :
    t("q1.a4")
  );
  const q2Label = (
    state.q2 === "numbers"    ? t("q2.a1") :
    state.q2 === "visibility" ? t("q2.a2") :
    state.q2 === "sellonline" ? t("q2.a3") :
    t("q2.a4")
  );
  const q3Label = (
    state.q3 === "trial" ? t("q3.a1") :
    state.q3 === "call"  ? t("q3.a2") :
    t("q3.a3")
  );

  const waText = t("waMessage", {
    q1: q1Label,
    q2: q2Label,
    q3: q3Label,
    products: productNames,
  });
  const waHref = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(waText)}`;

  // Primary product page
  const primaryProduct = outcome.products[0];
  const productHref =
    primaryProduct === "pos" ? "/products/pos" :
    primaryProduct === "ecommerce" ? "/products/ecommerce" :
    "/services/marketing";

  // A free trial only exists for POS and the online store, and only reads well
  // when there's one clear product to try — not a bundle of two or three.
  const showTrialCta =
    state.q3 === "trial" && outcome.products.length === 1 && primaryProduct !== "marketing";
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

        <div className="grid grid-cols-2 gap-4 border-t border-brass/10 pt-6">
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

        {/* Actions — asked for a free trial → that's the primary action. */}
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
            {t("ctaWhatsapp")}
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
