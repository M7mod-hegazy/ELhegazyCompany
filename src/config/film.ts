/**
 * The home-page brand film: one continuous scroll-scrubbed video in five
 * chapters. The real clips are generated in Gemini/Flow from
 * `docs/home-film-prompts.md` and dropped at `src` (all-keyframe encode —
 * see the prompts doc for the ffmpeg recipe). Until then a branded
 * placeholder film ships at the same path, so the page behaves identically.
 *
 * `zone` is the PHYSICAL negative-space area each clip leaves clear for the
 * overlay copy (the prompts reserve it) — physical, not RTL-logical, because
 * the video composition is fixed pixels.
 */

export type FilmZone = "center" | "bottom-left" | "bottom-right";

export type FilmChapterId = "intro" | "marketing" | "pos" | "ecommerce" | "outro";

export type SubBeat = {
  /** translation key under `Offerings.{chapterId}` — e.g. "ads", "creative" */
  tKey: string;
  /** optional screenshot to show alongside the step content */
  img?: string;
};

export type FilmChapterDef = {
  id: FilmChapterId;
  /** offering number shown as the chapter marker (title sequence style) */
  num?: string;
  zone: FilmZone;
  /** internal route for the chapter's "details" CTA */
  href?: string;
  accent: string;
  /** scroll height in vh — controls pacing; intro/outro shorter, offerings longer */
  vh: number;
  /** sub-beats shown as scroll progresses through this chapter */
  subBeats?: SubBeat[];
};

export const homeFilm = {
  src: "/films/home-film-1080p.mp4",
  srcMobile: "/films/home-film-mobile.mp4",
  poster: "/films/home-film-poster.jpg",
  posterDir: "/posters/home",
  chapters: [
    { id: "intro", zone: "center", accent: "#C9A86A", vh: 160 },
    {
      id: "marketing",
      num: "01",
      zone: "bottom-left",
      href: "/services/marketing",
      accent: "#7A2C26",
      vh: 320,
      subBeats: [
        { tKey: "beat1", img: "/shots/marketing/mk-ads.png" },
        { tKey: "beat2", img: "/shots/marketing/mk-content.png" },
        { tKey: "beat3", img: "/shots/marketing/mk-hero.png" },
        { tKey: "beat4", img: "/shots/marketing/mk-social.png" },
      ],
    },
    {
      id: "pos",
      num: "02",
      zone: "bottom-right",
      href: "/products/pos",
      accent: "#3A4A5A",
      vh: 320,
      subBeats: [
        { tKey: "beat1", img: "/shots/pos/pos-checkout.png" },
        { tKey: "beat2", img: "/shots/pos/stock-transfer.png" },
        { tKey: "beat3", img: "/shots/pos/reports-center.png" },
        { tKey: "beat4", img: "/shots/pos/whatsapp-crm.png" },
      ],
    },
    {
      id: "ecommerce",
      num: "03",
      zone: "bottom-left",
      href: "/products/ecommerce",
      accent: "#5A1F1B",
      vh: 320,
      subBeats: [
        { tKey: "beat1", img: "/shots/ecommerce/ec-storefront.png" },
        { tKey: "beat2", img: "/shots/ecommerce/ec-room-planner.png" },
        { tKey: "beat3", img: "/shots/ecommerce/ec-payment-methods.png" },
        { tKey: "beat4", img: "/shots/ecommerce/ec-dashboard.png" },
      ],
    },
    { id: "outro", zone: "bottom-right", accent: "#E8D6A8", vh: 160 },
  ] satisfies FilmChapterDef[],
} as const;

/** Derived: total scroll height in vh */
export const totalVh = homeFilm.chapters.reduce((s, ch) => s + ch.vh, 0);

/** Derived: cumulative start-vh for each chapter (index → startvh) */
export const chapterStarts = (() => {
  let acc = 0;
  return homeFilm.chapters.map((ch) => {
    const start = acc;
    acc += ch.vh;
    return start;
  });
})();
