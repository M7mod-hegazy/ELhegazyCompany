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
  proof: { id: string; value: string }[];
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
      { id: "checkout", shot: { id: "pos-checkout", device: "app" }, layout: "right" },
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
      { id: "crm", shot: { id: "whatsapp-crm", device: "app" }, layout: "right" },
      {
        id: "print",
        shot: { id: "print-designer", device: "app" },
        extraShots: [{ id: "receipt-80", device: "thermal" }],
        layout: "left",
      },
      { id: "offline", shot: { id: "backup", device: "app" }, layout: "right" },
    ],
    modulesAfter: "crm",
    modules: [
      { id: "restaurant", shot: { id: "mod-restaurant", device: "app" } },
      { id: "gold", shot: { id: "mod-gold", device: "app" } },
      { id: "serials", shot: { id: "mod-serials", device: "app" } },
      { id: "pharmacy", shot: { id: "mod-pharmacy", device: "app" } },
      { id: "clothing", shot: { id: "mod-clothing", device: "app" } },
      { id: "repair", shot: { id: "mod-repair", device: "app" } },
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
        { t: 180, id: "builder3d" },
        { t: 300, id: "payments" },
        { t: 450, id: "analytics" },
        { t: 600, id: "dashboard" },
      ],
    },
    chapters: [
      { id: "storefront", shot: { id: "ec-storefront", device: "browser" }, layout: "right" },
      {
        id: "builder3d",
        shot: { id: "ec-room-planner", device: "browser" },
        extraShots: [{ id: "ec-3d-viewer", device: "browser" }],
        layout: "left",
      },
      {
        id: "payments",
        shot: { id: "ec-checkout", device: "browser" },
        extraShots: [{ id: "ec-payment-methods", device: "phone" }],
        layout: "right",
      },
      {
        id: "analytics",
        shot: { id: "ec-dashboard", device: "app" },
        extraShots: [{ id: "ec-reports", device: "app" }],
        layout: "left",
      },
      {
        id: "products",
        shot: { id: "ec-products", device: "browser" },
        layout: "right",
      },
      {
        id: "mobile",
        shot: { id: "ec-mobile", device: "phone" },
        layout: "left",
      },
    ],
    modulesAfter: "payments",
    modules: [
      { id: "fashion", shot: { id: "mod-fashion", device: "browser" } },
      { id: "electronics", shot: { id: "mod-electronics", device: "browser" } },
      { id: "food", shot: { id: "mod-food", device: "browser" } },
      { id: "furniture", shot: { id: "mod-furniture", device: "browser" } },
      { id: "books", shot: { id: "mod-books", device: "browser" } },
      { id: "services", shot: { id: "mod-services", device: "browser" } },
    ],
    proof: [
      { id: "stores", value: "50+" },
      { id: "products", value: "10K+" },
      { id: "gateways", value: "5+" },
      { id: "languages", value: "AR/EN" },
    ],
  },
};

export function getWorld(key: string): WorldConfig | undefined {
  return worlds[key];
}
