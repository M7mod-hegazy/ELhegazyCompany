# شركة الحجازي — Cinematic Brand & Digital-Marketing Agency Website

## Context

شركة الحجازي is a furniture/home-furnishings business that **also** builds and runs its own retail software (the Electron POS app in `D:\code\retailer`) and its own e-commerce store (`arabian-blue-bloom-main`, live at http://elhegazi.vercel.app/). The owner now wants to commercialize **digital-marketing services** (paid Facebook/Instagram ad campaigns, image creation, video/reels production, brand identity, and web/e-commerce builds) under one branded umbrella.

This project is a **brand-new, standalone, high-end marketing-agency website** whose #1 job is to sell those services and prove credibility ("we don't just advertise — we build and operate real commerce"). The explicit requirement is a **wow-first, number-one front-end**: animations, real 3D, cinematic motion — measurably better than the owner's existing portfolio site (`admin-portofolio-main`), whose weaknesses (system-ui fonts, generic purple→cyan AI gradient, blanket animate-everything rules) we deliberately avoid.

**North-star reference (owner-approved):** `igloo.inc` — single reflective metal hero object + immersive scroll-driven 3D, pure React Three Fiber. Also: `lusion.co`, `basement.studio`, `dennissnellenberg.com`, `cuberto.com`, and Apple product pages (`apple.com/airpods-pro/`) as proof the scroll-driven-3D pattern is mainstream and safe.

---

## How to Resume This Plan in the New Project (READ FIRST)

This document is a **complete, self-contained brief**. A fresh session opening it in the new project folder should treat it as the single source of truth and pick up exactly here — **no re-grilling, no re-exploring the two existing repos** (their findings are captured below).

**Starting steps in the new folder:**
1. Confirm the new project folder (owner is creating it, e.g. `D:\code\elhegazi-agency` or similar). All scaffolding happens there.
2. Read this whole file. The decision table, brand tokens, and section designs are FINAL unless the owner changes them.
3. Begin **Phase 0** in the Build Sequence (scaffold Next.js 15 + brand foundation), then proceed phase-by-phase with a review checkpoint after each.
4. Owner's taste anchors: **north-star = `igloo.inc`**; the bar to beat = the owner's portfolio (`admin-portofolio-main`) whose failures we explicitly avoid (system-ui fonts, purple→cyan AI gradient, blanket animate-everything). Wow on **every** section, not just the hero.
5. Use placeholders (one config file `src/config/site.ts`) for contact info/metrics; never block on owner-supplied assets.
6. Skills to invoke during build: **brandkit** (logo/identity), **high-end-visual-design / design-taste-frontend / impeccable / gpt-taste** (premium discipline), **imagegen-frontend-web** (imagery), **frontend-design**.

---

## Source Repositories — what exists & what to reuse (no need to re-explore)

Two existing repos belong to the owner. **They are reference + asset sources only — the agency site is a separate new repo.** Despite living under a `...\django\` path, **neither is Django**; both are React + Vite + TypeScript.

### A) Portfolio site — `C:\Users\M7mod Hegazy\Desktop\asd\django\admin-portofolio-main`
**This is the quality bar to BEAT.** Personal portfolio of "Mahmoud Hegazi."
- Stack: React 18 + TS + **Vite 5**, shadcn/ui + Tailwind 3, Express + Mongoose + Cloudinary backend with a full admin CMS, deployed on Vercel (hybrid `@vercel/node` + static). English only, no RTL. Lovable.dev origin.
- Heavy front-end: **framer-motion**, **Three.js + R3F + drei** (15 dedicated 3D components: HeroCore3D, SkillGalaxy, EarthSphere, ProjectGallery3D, etc.), **hand-written GLSL shaders** (`LivingBackground.tsx`), `@studio-freight/lenis` smooth scroll, embla carousel.
- Palette: dark + **generic purple `#8B...`→cyan AI gradient**, glassmorphism everywhere.
- **Why it falls short (DO NOT REPEAT):** (1) **system-ui fonts** — no real type system (its single biggest tell); (2) the over-used purple/cyan gradient + glass-on-everything; (3) blanket global rules that animate *every* img/button/a/section ("QUICK WIN" blocks) = busy, not art-directed; (4) leftover scaffold cruft.
- **Takeaway:** match/exceed its technical ambition (R3F, shaders, Lenis) but win decisively on **typography discipline, a singular color story, and intentional signature motion**.

### B) E-commerce store — `C:\Users\M7mod Hegazy\Desktop\asd\django\arabian-blue-bloom-main` (live: http://elhegazi.vercel.app/)
The owner's real **furniture / interior-fit-out** store. This is **case-study World 3** + an **asset source**.
- Stack: React 18 + TS + **Vite 5**, shadcn/ui + Tailwind 3, Express 5 + **Mongoose/MongoDB** + Cloudinary + Nodemailer backend, Hono edge fn on Vercel. **Arabic-first, RTL**, **Cairo** font. GitHub `M7mod-hegazy/Elhegazi-2.0`.
- **Reusable for World 3 (E-commerce 3D walk):** a real **3D Shop Builder / Room Planner** at `src/features/shop-builder/` (Three.js + R3F + drei) **with real furniture GLTF models** — pull these models/assets for the 3D room walk.
- Heavy motion stack already present (Framer, GSAP, anime.js, react-spring, Lenis, Swiper, Lottie) — confirms the owner's appetite/comfort with this caliber.
- Branding is **DB-driven/generic** in code (default name `متجر إلكتروني`, default blue `#3B82F6`/violet, placeholder logo `public/iconPng.png`) — so there is **no real ElHegazi brand identity committed anywhere**. The agency site (this project) becomes the **first real codified brand**. Capture screenshots of the live store + room planner for the case study.

### C) POS / Retail app — `D:\code\retailer` (THIS repo we grilled in)
Electron desktop POS for Arabic retail (React/Vite client + Express/better-sqlite3 server). This is **case-study World 2** + screenshot source: capture real UI (shifts, treasury/banks, warehouses, purchase flow, loyalty) for the POS 3D walk. RTL, Cairo-style Arabic UI.

**Asset-pull summary:** real screenshots from B + C; **GLTF furniture models from B's `shop-builder`** for World 3's 3D scene; everything else generated by image/design skills.

---

## Locked Decisions (from grilling)

| Decision | Choice |
|---|---|
| Site purpose | Digital-marketing **agency** site (services drive design; app + store = proof) |
| Project form | **New standalone repo**, own Vercel deployment |
| Language | **Bilingual AR/EN**, Arabic-first RTL with EN toggle |
| Framework | **Next.js 15 (App Router)** |
| Content/data | **Static content in code** + lead capture |
| Lead notify | **WhatsApp-first** (compose prefilled WhatsApp) + leads saved to **MongoDB Atlas** (free); **no email infra** |
| Domain | Free Vercel subdomain now (custom domain later, 1-click) |
| Art direction | **Cinematic Luxury "Atelier"** — near-black ink + warm metal, vast negative space, slow cinematic 3D, film grain |
| Metal accent (brand color) | **Champagne brass** (~`#C9A86A`, highlights `#E8D6A8`) |
| Secondary tone | **Deep oxblood / burgundy** (~`#5A1F1B`) |
| Typography | **Reem Kufi** (AR display) + **Fraunces** (EN display); body **IBM Plex Sans Arabic** + **Inter** |
| Logo | **ح monogram + الحجازي wordmark** system — concepted via brandkit, shipped as crisp SVG |
| Hero 3D | **Brass sculptural artifact** (ح abstracted), reflective metal, slow breathing, mouse-parallax; transforms through page |
| Motion | **Full cinematic** — Lenis smooth-scroll + GSAP ScrollTrigger (pin/scrub/stack), reduced-motion fallbacks |
| Mobile 3D | **Adaptive** — full 3D on capable GPUs, lighter on mid phones, static/pre-rendered fallback on weak/reduced-motion |
| Structure | **Long-scroll home** (navbar) + each offering has a section w/ hover-preview + **Details → dedicated full page** |
| Offerings | (1) **Digital Marketing** (4 pillars inside), (2) **Retail/POS app**, (3) **E-commerce app** |
| 4 marketing pillars | Rich **sections inside** the Marketing world page (not 4 separate pages) |
| Worlds | **One brand system, distinct signature per world** (own secondary accent, layout rhythm, motion, 3D motif) |
| Proof | Flagship case studies: store + POS app + campaign metrics (representative placeholders, swappable) |
| Product showcase | **Interactive 3D product walk** — **prototype-first** (live Vercel preview approved before full build); premium animated device-mockups as guaranteed fallback |
| Assets | **Mix** — I pull real screenshots from app+store repos + generate premium mockups/imagery/copy; owner swaps key real assets (real screenshots, metrics, contact info) later |
| Contact info | **Placeholders in one config file** (WhatsApp #, email, IG/FB, location) — owner swaps later |
| Sequencing | **Phased**: brand + home + lead flow first (deployable), then each world one-by-one |

---

## Brand System (design tokens — single source of truth)

Create `src/styles/tokens.css` + a typed `src/lib/brand.ts`:

- **Ink** background scale: `#0A0A0B` → `#141416` → `#1E1E22` (near-black, slightly warm).
- **Brass** accent scale: base `#C9A86A`, highlight `#E8D6A8`, deep `#9A7C45`. Used for the metal material, key type accents, rules, focus rings.
- **Oxblood** secondary: `#5A1F1B` (+ tint `#7A2C26`) — per-world tinting, depth, select hovers.
- **Bone** text: `#EDE7DA` (warm off-white) for body on ink; muted `#A39C8E`.
- **Type scale**: editorial, high-contrast. Display (Reem Kufi/Fraunces) huge & tight; body comfortable. Fluid `clamp()` scale, no system-ui anywhere.
- **Texture**: subtle film grain overlay (SVG/`feTurbulence` or a tiled PNG at low opacity), soft vignette, spotlight gradients. **No glassmorphism, no rainbow gradients** (the portfolio's tells).
- **Motion tokens**: shared easings (a cinematic ease-out), durations, and a per-world "signature" descriptor.

**Logo:** generate 3–4 concept boards with the **brandkit** skill (ح monogram explorations + wordmark), owner picks, then hand-build the chosen mark as optimized SVG → favicon set, nav logo (AR/EN lockups), and OG image.

---

## Tech Stack

- **Next.js 15 App Router** + **TypeScript** + **Tailwind CSS v4** (tokens via CSS vars) + a few **Radix** primitives (only for the brief form's accessibility — dialog/select/progress).
- **3D**: `three`, `@react-three/fiber`, `@react-three/drei` (env maps, `ScrollControls`/`useScroll`, `Float`, `MeshTransmission`/`MeshReflectorMaterial`), `@react-three/postprocessing` (bloom/vignette/film-grain). HDRIs from Poly Haven for brass reflections.
- **Motion**: `gsap` + `ScrollTrigger` (free), `lenis` smooth scroll, `framer-motion` for component-level reveals/micro-interactions.
- **i18n**: `next-intl` (or App Router `[locale]` segments) — AR (RTL) + EN (LTR), `dir` switching, two message catalogs.
- **Lead capture**: Next **server action** → MongoDB Atlas (official `mongodb` driver) for the lead record; client composes a **prefilled WhatsApp deep link** (`wa.me/<number>?text=...`) as the primary CTA.
- **Fonts**: `next/font` (Google) for Reem Kufi, Fraunces, IBM Plex Sans Arabic, Inter — self-hosted/optimized, no layout shift.
- **SEO/quality**: Next Metadata API, dynamic OG images (`next/og`), sitemap/robots, `@vercel/analytics`, `@vercel/speed-insights`.
- **Perf guardrails**: device/GPU tier detection (`detect-gpu` or capability heuristics) to pick the adaptive 3D level; `prefers-reduced-motion` honored everywhere; dynamic-import all 3D (`ssr:false`) with elegant static fallbacks; capped `dpr`.

---

## Site Architecture

```
/[locale]
  /                     Home — long-scroll cinematic narrative + navbar
  /work                 Flagship case studies index (store + app + campaigns)
  /services/marketing   WORLD 1 — Digital Marketing (4 pillars as sections)
  /products/pos         WORLD 2 — Retail/POS app (interactive 3D product walk)
  /products/ecommerce   WORLD 3 — E-commerce app (interactive 3D product walk)
  /start                "Start a project" guided brief + WhatsApp
  (footer: quick contact, socials, WhatsApp, language toggle)
```

Navbar: brass wordmark, links to the 3 offering worlds + Work + Start, AR/EN toggle, sticky with scroll-state restyle. RTL/LTR mirrored.

---

## Home Page — section-by-section (wow on every section, not just hero)

1. **Pre-hydration loader** — ink screen, brass monogram drawing itself (SVG stroke), no blank flash. (Learned from portfolio's good loader, refined.)
2. **Hero** — the **brass sculptural ح-artifact** in a live R3F canvas: reflective metal (HDRI env map), soft spotlight, slow breathing rotation, mouse-parallax, film grain + subtle bloom. Headline set in Reem Kufi (AR) / Fraunces (EN) with mix-blend over the object. Staggered reveal. Scroll cue. Adaptive: heavy → light → static poster.
3. **Positioning line** — one oversized editorial statement (نصنع العلامات التي تُرى / "We build brands people *see*"), pinned + scrub-revealed word by word.
4. **Offerings showcase** — 3 large panels (Marketing / POS / E-commerce). Each: cinematic hover-preview (the brass object morphs toward that world's motif; short looping visual), a one-line promise, and a **Details →** button into the dedicated world. On mobile: tap-to-preview.
5. **Proof / results** — animated brass counters (ROAS, reach, sales lift — placeholder metrics) + a strip of flagship case thumbnails; pinned horizontal scroll on desktop.
6. **Process** — 3–4 steps (اكتشاف → إبداع → إطلاق → نمو), revealed as a scrubbed timeline.
7. **Why الحجازي** — the differentiator: "we operate our own store + software." Editorial split layout.
8. **CTA band** — big "ابدأ مشروعك / Start a project" → `/start`, with a visible WhatsApp button.
9. **Footer** — wordmark, quick contact, socials, WhatsApp, language toggle, fine print.

Each section has a deliberate **signature moment** (a single strong motion idea) — never the blanket "animate every element" anti-pattern.

---

## The three Worlds (one system, distinct signatures)

- **WORLD 1 — Digital Marketing** (`/services/marketing`): the most **energetic/kinetic** world. Secondary-accent leans oxblood→brass heat. The 4 pillars are full art-directed sections:
  - **Paid Ads / Performance** — a live "campaign console" motif: animated metrics, audience targeting visual, ROAS counters.
  - **Creative / Image production** — a masonry/marquee gallery of generated ad creatives with hover depth.
  - **Video & Reels** — a 9:16 reels wall, autoplaying muted loops, scroll-scrubbed scrubber.
  - **Brand Identity & Web/E-commerce** — shows *this very site* + the store/app as living proof of capability.
- **WORLD 2 — Retail/POS app** (`/products/pos`): **precise/architectural** product world. Cooler, more structured grid, technical brass linework. Centerpiece = interactive 3D walk of the app floating in space, screenshots on planes, scroll-scrubbed feature callouts (shifts, treasury, warehouses, loyalty). Real screenshots captured from the running app.
- **WORLD 3 — E-commerce app** (`/products/ecommerce`): **warm, tactile showroom**. Reuses real furniture **GLTF models from the store's existing `shop-builder`** for a 3D room walk; warm oxblood tint; product-card motion; links to live store.

Each world reuses shared layout primitives + tokens but defines its own `signature` (accent emphasis, motion ease, 3D motif) so they feel distinct yet unmistakably one brand.

---

## 3D & Motion Engineering

- **Hero artifact**: procedural/abstracted ح form (start procedural; optionally a sculpted GLTF later). `MeshReflectorMaterial`/transmission + Poly Haven HDRI; `@react-three/postprocessing` for bloom + film grain + vignette.
- **Scroll-driven worlds**: drei `ScrollControls` + `useScroll` drive camera along a path; GSAP `ScrollTrigger` for pinned/scrubbed/stacked DOM sections; Lenis unifies scroll feel.
- **Adaptive tiers** (one capability check at mount):
  - **High** (good GPU, no reduced-motion): full 3D + postprocessing.
  - **Mid** (phones): fewer particles, no postprocessing, capped `dpr`, simpler material.
  - **Low / reduced-motion / SSR**: pre-rendered poster image or `<video>` loop; CSS-only reveals.
- All 3D `dynamic(() => ..., { ssr:false })` with a branded skeleton; never blocks first paint or SEO.

---

## Lead Flow (`/start`)

Guided multi-step brief (Radix-accessible, animated): **service(s) of interest → budget range → timeline → about your business → name + contact**. On submit:
1. Next **server action** saves the lead to MongoDB Atlas (`leads` collection).
2. Client builds a **prefilled WhatsApp message** (`wa.me/<PLACEHOLDER>?text=<encoded brief>`) and offers a prominent "أرسل عبر واتساب / Send via WhatsApp" button.
3. Quick-contact + WhatsApp also live in the footer on every page.

No email service (per decision). MongoDB URI + WhatsApp number live in env/config.

---

## Content & Assets Strategy

- **Real, pulled by me**: capture screenshots from the POS app (this repo) and the store (run/inspect `arabian-blue-bloom-main`); reuse the store's existing furniture GLTF models for World 3.
- **Generated by me** (image/design skills): hero poster, section imagery, ad-creative mockups, premium device frames, OG image, brand boards.
- **Copy**: I author polished Arabic + English for every section.
- **Placeholders the owner swaps later**: real campaign metrics, final contact info (one config file `src/config/site.ts`), any real client logos/case media.

---

## Skills / tools I will use (no installs required by owner)

- **brandkit** → logo concept boards + brand identity.
- **high-end-visual-design / design-taste-frontend / impeccable / gpt-taste** → enforce premium type/spacing/motion discipline and kill generic-AI defaults.
- **imagegen-frontend-web** → hero/section reference imagery and generated creatives.
- **frontend-design** → aesthetic direction checks.
- npm packages only (listed in Tech Stack). Free services: Vercel, MongoDB Atlas free tier, Poly Haven HDRIs, Google Fonts.

---

## Build Sequence (phased)

**Phase 0 — Scaffold & brand foundation**
- New Next.js 15 repo, Tailwind v4, tokens, fonts, i18n (AR/EN), Lenis, GSAP, R3F baseline, `src/config/site.ts` placeholders, Vercel project + MongoDB Atlas.
- brandkit logo boards → owner picks → ship SVG mark + favicons.
- Concrete kickoff (run inside the new project folder):
  ```bash
  npx create-next-app@latest . --ts --app --tailwind --eslint --src-dir --import-alias "@/*"
  npm i three @react-three/fiber @react-three/drei @react-three/postprocessing \
        gsap lenis framer-motion next-intl mongodb
  npm i -D @types/three detect-gpu
  npx vercel link        # create/link the Vercel project
  ```
- First files: `src/styles/tokens.css`, `src/lib/brand.ts`, `src/config/site.ts` (placeholders), `next/font` setup (Reem Kufi, Fraunces, IBM Plex Sans Arabic, Inter), `[locale]` routing + AR/EN catalogs, Lenis+GSAP provider.

**Phase 1 — Cinematic Home + lead flow (first deployable site)**
- Brass hero artifact + all home sections + navbar/footer + `/start` brief + WhatsApp + MongoDB lead save. Deploy to Vercel preview. **Review checkpoint.**

**Phase 1.5 — 3D-walk PROTOTYPE (de-risk, owner-approved gate)**
- Small standalone live 3D product-walk demo deployed to a preview URL; owner opens on phone + desktop and approves the feel **before** full world build. Premium animated mockups built as the fallback in parallel.

**Phase 2 — World 1: Digital Marketing** (4 pillar sections). Review.

**Phase 3 — World 2: POS app** (interactive 3D walk + real screenshots). Review.

**Phase 4 — World 3: E-commerce app** (3D room walk reusing store GLTFs). Review.

**Phase 5 — Work/case-studies page, polish pass, perf/a11y/SEO, OG images, analytics, final deploy.**

Each phase ends deployable and reviewed; quality stays high per world.

---

## Verification

- **Per phase**: deploy to a Vercel preview URL; owner opens on **desktop + real phone** (the responsiveness + battery/jank test that matters most).
- **3D**: confirm adaptive tiers — force reduced-motion and a throttled device to verify static fallbacks render and the page never janks/blocks.
- **Lead flow**: submit the brief → confirm a document lands in MongoDB Atlas and the WhatsApp deep link opens with the brief prefilled.
- **i18n**: toggle AR/EN → verify full RTL/LTR mirroring, fonts, and no clipped Arabic.
- **Quality bars**: Lighthouse (mobile) performance/accessibility/SEO checked each phase; compare side-by-side against `admin-portofolio-main` to confirm we clear its bar on typography, color discipline, and intentional (not blanket) motion.
- **Cross-browser**: Chrome + Safari (WebKit) for 3D/scroll behavior.

---

## Inputs needed from owner (non-blocking — placeholders until provided)

- **The new project folder path** (owner is creating it — all work happens there; this plan lives at `~/.claude/plans/i-want-to-brand-nifty-anchor.md` and should be copied/referenced into the new repo, e.g. as `docs/PLAN.md`, so it travels with the project).
- WhatsApp number, contact email, Instagram/Facebook handles, physical location/city.
- Any real campaign metrics + real client logos/media (swapped into placeholders later).
- MongoDB Atlas connection string + Vercel access (or I scaffold and you connect).
- Final logo pick from the brandkit concept boards.
