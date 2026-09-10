import { brand } from "@/lib/brand";
import { siteConfig } from "@/config/site";

/**
 * Single source of truth for each offering "world" page. Everything the owner
 * swaps later — the explainer video source + chapter timestamps, and which
 * screenshots exist — is expressed here as data, so no component code changes.
 *
 * Copy (kicker/title/body/bullets/…) lives in messages under `Worlds.<key>`.
 * Real screenshots drop into `public/shots/<key>/<shot.id>.png` and `ShotFrame`
 * shows them automatically instead of the labelled placeholder.
 */

export type ShotDevice = "app" | "thermal" | "phone" | "browser" | "a4";
export type Shot = { id: string; device: ShotDevice };

export type Chapter = {
  /** also the messages subkey `Worlds.<key>.chapters.<id>` and shot folder anchor */
  id: string;
  shot: Shot;
  extraShots?: Shot[];
  layout?: "left" | "right";
};

export type VideoChapter = { t: number; id: string };
export type WorldVideo = {
  /** null → branded "coming soon" placeholder; owner sets provider+id later */
  provider: "youtube" | "vimeo" | "mux" | "file" | null;
  id: string | null;
  poster: string;
  chapters: VideoChapter[];
};

export type WorldModule = { id: string; shot: Shot };

export type WorldConfig = {
  key: "pos" | "marketing" | "ecommerce";
  num: string;
  accent: string;
  signature: string;
  model?: string;
  href: string;
  video: WorldVideo;
  /** the scroll story; ModuleGallery (if `modules`) is placed after `modulesAfter` */
  chapters: Chapter[];
  modulesAfter?: string;
  modules?: WorldModule[];
  proof?: { id: string; value: string }[];
  externalHref?: string;
};

export const worlds: Record<string, WorldConfig> = {
  pos: {
    key: "pos",
    num: "02",
    accent: brand.worlds.pos.accent,
    signature: brand.worlds.pos.signature,
    model: "/models/CashRegister_01.glb",
    href: "/products/pos",
    video: {
      provider: null,
      id: null,
      poster: "/posters/home/pos.jpg",
      chapters: [
        { t: 0, id: "intro" },
        { t: 60, id: "checkout" },
        { t: 180, id: "shifts" },
        { t: 300, id: "inventory" },
        { t: 450, id: "reports" },
        { t: 600, id: "crm" },
        { t: 720, id: "modules" },
        { t: 840, id: "print" },
        { t: 900, id: "offline" },
      ],
    },
    chapters: [
      {
        id: "checkout",
        shot: { id: "pos-checkout", device: "app" },
        extraShots: [{ id: "fast-checkout", device: "app" }],
        layout: "right",
      },
      {
        id: "shifts",
        shot: { id: "shift-close", device: "app" },
        extraShots: [{ id: "treasury-ledger", device: "app" }],
        layout: "left",
      },
      {
        id: "inventory",
        shot: { id: "stock-transfer", device: "app" },
        extraShots: [{ id: "physical-count", device: "app" }],
        layout: "right",
      },
      {
        id: "reports",
        shot: { id: "reports-center", device: "app" },
        extraShots: [{ id: "owner-dash", device: "app" }],
        layout: "left",
      },
      {
        id: "crm",
        shot: { id: "whatsapp-crm", device: "app" },
        extraShots: [{ id: "whatsapp-invoice", device: "app" }],
        layout: "right",
      },
      {
        id: "users",
        shot: { id: "pos-users", device: "app" },
        extraShots: [{ id: "pos-roles", device: "app" }],
        layout: "left",
      },
      {
        id: "employees",
        shot: { id: "pos-employees", device: "app" },
        extraShots: [{ id: "payroll", device: "app" }],
        layout: "right",
      },
      {
        id: "sync",
        shot: { id: "pos-sync", device: "app" },
        extraShots: [{ id: "sync-orders", device: "app" }],
        layout: "left",
      },
      {
        id: "print",
        shot: { id: "print-designer", device: "app" },
        extraShots: [{ id: "receipt-80", device: "app" }],
        layout: "right",
      },
      {
        id: "offline",
        shot: { id: "backup", device: "app" },
        extraShots: [{ id: "offline-mode", device: "app" }],
        layout: "left",
      },
    ],
    proof: [
      { id: "reports", value: "100+" },
      { id: "shopTypes", value: "10" },
      { id: "offline", value: "100%" },
      { id: "rtl", value: "AR" },
    ],
  },
  ecommerce: {
    key: "ecommerce",
    num: "03",
    accent: brand.worlds.ecommerce.accent,
    signature: brand.worlds.ecommerce.signature,
    href: "/products/ecommerce",
    externalHref: siteConfig.store.url,
    video: {
      provider: null,
      id: null,
      poster: "/posters/ecommerce.jpg",
      chapters: [
        { t: 0, id: "intro" },
        { t: 60, id: "storefront" },
        { t: 180, id: "sync" },
        { t: 300, id: "payments" },
        { t: 450, id: "analytics" },
        { t: 600, id: "dashboard" },
      ],
    },
    // Was 6 chapters built around abstract capabilities (storefront / 3D /
    // payments / analytics / products / mobile), several pointing at shots
    // that were either never real (admin dashboard, behind a login we can't
    // use) or didn't match how this business actually sells (a checkout/
    // payment-gateway flow — real orders happen over WhatsApp). Rebuilt as a
    // tour of the real, live store: one chapter per actual page, each with
    // that page's real desktop screenshot as the primary shot and its real
    // mobile screenshot as the second (StoryChapter already renders `shot` +
    // `extraShots` as a stacked desktop+mobile pair — no layout change
    // needed, just real content in both slots). The 3D planner is
    // deliberately excluded — it's covered elsewhere already, and there are
    // enough other real pages to fill this tour without it.
    chapters: [
      { id: "home", shot: { id: "ec-home", device: "browser" }, extraShots: [{ id: "ec-home-mobile", device: "phone" }], layout: "right" },
      { id: "login", shot: { id: "ec-login", device: "browser" }, extraShots: [{ id: "ec-login-mobile", device: "phone" }], layout: "left" },
      { id: "product", shot: { id: "ec-product", device: "browser" }, extraShots: [{ id: "ec-product-mobile", device: "phone" }], layout: "right" },
      { id: "products", shot: { id: "ec-products", device: "browser" }, extraShots: [{ id: "ec-products-mobile", device: "phone" }], layout: "left" },
      // No real screenshot — behind the store's admin login, which we don't
      // have credentials for. Shown as a clearly-labelled placeholder
      // instead of skipped entirely, since the capability is real even
      // without a photo of it. (There was a second admin chapter here about
      // reports, but that isn't an actual feature of this store — cut
      // rather than describe something that doesn't exist.)
      { id: "dashboard", shot: { id: "ec-dashboard", device: "app" }, layout: "right" },
      { id: "categories", shot: { id: "ec-categories", device: "browser" }, extraShots: [{ id: "ec-categories-mobile", device: "phone" }], layout: "left" },
      { id: "about", shot: { id: "ec-about", device: "browser" }, extraShots: [{ id: "ec-about-mobile", device: "phone" }], layout: "right" },
      { id: "portfolio", shot: { id: "ec-portfolio", device: "browser" }, extraShots: [{ id: "ec-portfolio-mobile", device: "phone" }], layout: "left" },
      { id: "locations", shot: { id: "ec-locations", device: "browser" }, extraShots: [{ id: "ec-locations-mobile", device: "phone" }], layout: "right" },
      { id: "offers", shot: { id: "ec-offers", device: "browser" }, extraShots: [{ id: "ec-offers-mobile", device: "phone" }], layout: "left" },
      { id: "bestsellers", shot: { id: "ec-bestsellers", device: "browser" }, extraShots: [{ id: "ec-bestsellers-mobile", device: "phone" }], layout: "right" },
    ],
  },
};

export function getWorld(key: string): WorldConfig | undefined {
  return worlds[key];
}
