"use client";

import { useTranslations } from "next-intl";
import { getFeaturedProjects } from "@/config/projects";
import { ExpandingPanels } from "@/components/projects/ExpandingPanels";
import { Link } from "@/i18n/navigation";

/**
 * SelectedWork — the featured strip on the home page.
 *
 * The link out to /projects used to be plain muted body text with no
 * affordance, which made the only route to the portfolio invisible. It is a
 * full-width hairline row now: the whole row is the target, and the brass rule
 * under it draws in on hover.
 *
 * The "we build more than the 3 core products" message lives in this same
 * header now, next to the headline, instead of as its own section above —
 * a separate boxed section with its own icon grid read as disconnected
 * filler with no relationship to the panels it was supposedly introducing.
 * Folded in here, the tiles sit one glance away from the actual proof (the
 * panels below), and there's no seam to look disconnected across.
 *
 * The tile list is its own curated set (`CAPABILITIES` below), not the
 * `/projects` filter categories — POS, e-commerce and marketing are already
 * the entire rest of the home page, so repeating them here just made this
 * "we do more than that" moment list the exact three things it was trying to
 * point past. This is company sites, portfolios, and other client work.
 */
const CAPABILITIES = ["companySites", "portfolios", "brand", "video", "webApps", "landingPages"] as const;
type Capability = (typeof CAPABILITIES)[number];

export function SelectedWork() {
  const t = useTranslations("Projects");
  const tCap = useTranslations("Capabilities");
  const featured = getFeaturedProjects(3);

  if (featured.length === 0) return null;

  return (
    <section aria-labelledby="selected-heading" className="relative border-t border-brass/10">
      <div className="mx-auto max-w-7xl px-6 pb-14 pt-16">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-brass">
          {t("selectedTitle")}
        </p>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 id="selected-heading" className="max-w-xl text-3xl font-semibold text-bone sm:text-4xl">
            {t("title")}
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-bone-muted lg:text-end">
            {tCap("body")}
          </p>
        </div>

        {/* Six kinds of work, full width — this is the "we build more than
            the 3 core products" moment, given real visual weight instead of
            a sidebar note, but still inside this section's own header: no
            border, no gap, no separate surface to look disconnected from
            the panels it leads straight into. */}
        <ul className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {CAPABILITIES.map((cap) => (
            <li
              key={cap}
              className="group flex flex-col items-center gap-3 border border-brass/15 bg-ink-800/40 px-3 py-7 text-center transition-all duration-300 hover:-translate-y-1 hover:border-brass/50 hover:bg-ink-800/70"
            >
              <span className="grid h-12 w-12 place-items-center border border-brass/25 text-brass transition-colors group-hover:border-brass">
                <CapabilityIcon capability={cap} />
              </span>
              <span className="font-mono text-[0.7rem] uppercase tracking-wider text-bone-muted transition-colors group-hover:text-bone">
                {tCap(`items.${cap}`)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Full-bleed on desktop; the mobile card list carries its own padding. */}
      <ExpandingPanels projects={featured} />

      {/* Closing bar — sits flush against the panels, same dark tone as their
          own frame, so it reads as the strip's bottom edge rather than a
          separate floating band with the page's atmosphere showing through
          the gap. The link itself is a real button now, not a text row. */}
      <div className="border-t border-brass/10 bg-ink-800 py-10">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <Link
            href="/projects"
            className="group inline-flex items-center gap-3 bg-brass px-8 py-3.5 font-mono text-sm font-semibold text-ink-900 transition-colors hover:bg-brass-hi"
          >
            {t("seeAll")}
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
              ↗
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Simple mono-line icons, one per capability. ── */
function CapabilityIcon({ capability }: { capability: Capability }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-5 w-5",
  };
  switch (capability) {
    case "companySites":
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="1.5" />
          <path d="M3 9h18M6.5 7h.01M9 7h.01" />
        </svg>
      );
    case "portfolios":
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="4" width="8" height="8" rx="1" />
          <rect x="13" y="4" width="8" height="12" rx="1" />
          <rect x="3" y="14" width="8" height="6" rx="1" />
        </svg>
      );
    case "brand":
      return (
        <svg {...common} aria-hidden>
          <path d="M12 3c-4.5 0-8 3-8 7 0 3 2 5 4.5 5H10a1.5 1.5 0 0 1 0 3H9" />
          <circle cx="8.5" cy="10" r="1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="15.5" cy="10" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "video":
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="6" width="13" height="12" rx="1.5" />
          <path d="M16 10.5 21 8v8l-5-2.5" />
        </svg>
      );
    case "webApps":
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="4" width="18" height="16" rx="1.5" />
          <path d="M3 9h18M7 13h4M7 16h7" />
        </svg>
      );
    case "landingPages":
      return (
        <svg {...common} aria-hidden>
          <rect x="4" y="3" width="16" height="18" rx="1.5" />
          <path d="M7.5 8h9M7.5 11h9" />
          <rect x="7.5" y="14.5" width="5" height="3" rx="0.5" />
        </svg>
      );
    default:
      return null;
  }
}
