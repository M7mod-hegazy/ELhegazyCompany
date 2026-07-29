# ElHegazi — Full Site Rebuild Plan

> **Read this whole file before writing any code.**
> Execute the phases **in order**. Do not skip ahead. Each phase ends with a check you must run.
> Project root: `D:\code\ElhegazyCompany`

---

## 1. Context

`elhegazi-agency` is a Next.js 16 / React 19 / Tailwind v4 bilingual (Arabic-default RTL + English) site for **شركة الحجازي** — an Egyptian furniture business that also built its own Electron POS system and its own e-commerce store, and now sells digital-marketing services. The pitch is: *"we are the first customer of everything we build."*

Three things are wrong today and this plan fixes all of them:

1. **The home film is broken.** It sometimes freezes on a single frame and it lags on desktop and mobile. Root cause is proven, not guessed:
   - `public/films/home-film-1080p.mp4` has **4 keyframes in 16 seconds**; the mobile file has **3**.
   - The outro's scroll range (11.96s → 15.95s) contains **zero keyframes**, so every scroll tick forces the decoder to replay up to 132 predicted frames. It cannot keep up, so the browser keeps painting the last frame it finished — **that is the "shows as an image" bug**.
   - `moov` is at the **end** of both files (no `+faststart`), so playback can't begin until the whole file is fetched.
   - The `<video>` has **no `poster`**, so before the first decode you see flat black.
   - Two 19 MB video elements mount at once, each running a `requestAnimationFrame` loop that **never idles** (the idle counter only increments inside the in-view branch, so off-screen it spins forever).
   - Lenis smooth-scroll inertia emits ~60 distinct seek targets per flick against a seek threshold (0.03s) that is **smaller than one frame** (0.0417s), so seeks constantly abort each other.

2. **The home page has no point of view.** It is three near-identical product blocks separated by two near-identical placeholder blocks. Several sections render literal English `"Screenshot"` placeholder text even on the Arabic locale.

3. **There is no page showing the company's other work**, and the existing `/work` page is backed by a MongoDB database that is not set up, so it renders empty.

**Outcome:** a rebuilt home page where every section presents its information in a different physical form, reliable video everywhere, a new hardcoded projects page, a merged contact page, video heroes on every nav page, and the entire database layer removed.

---

## 2. Locked decisions (do not revisit these)

| Decision | Locked answer |
|---|---|
| Video technique | **Ambient playback, never scroll-seeking.** Scroll drives the *frame around* the video (mask, scale, letterbox, text), never `video.currentTime`. |
| Mobile video | **Separate 9:16 portrait encode for every video.** No center-cropping a 16:9 frame. |
| Projects page look | **Expanding panels** — vertical image strips that widen on hover/tap and reveal full info inside. |
| Projects data | **Hardcoded** in `src/config/projects.ts`. Full case record per project. No admin, no upload. |
| Database | **Remove MongoDB entirely.** Contact and order flows become WhatsApp hand-offs only. |
| Navigation | التسويق · نقاط البيع · المتجر · **مشاريعنا** · **تواصل** + `ابدأ مشروعك` button. `/work` is deleted and redirects to `/projects`. |
| Home section 2 | **The Diagnostic** — 3 tap-only questions → a recommendation with price range, duration, and a pre-filled WhatsApp link. |
| Parallax sections | **#1 "The Counter"** (close-up shop counter) and **#2 "The Grid"** (overhead specimen tray). Both interactive. |
| Page video heroes | **Fresh video prompts for all 5 nav pages.** Clips 2/3/4 are NOT used. |
| Contact | **One merged `/contact` page.** Form on top, video behind/below. `/start` redirects here. |

---

## 3. Design system — the direction

The look is **engraved brass on ink**: a museum-grade, near-black surface carved by warm metal light. It is already half-established in the codebase; this plan finishes it and commits to it hard.

**Palette** (already in `globals.css`, keep exactly, add one):
```
ink-900   #0A0A0B   page ground
ink-800   #141416   raised surface
ink-700   #1E1E22   hairline / inset
brass     #C9A86A   THE brand colour
brass-hi  #E8D6A8   specular highlight
brass-deep #9A7C45  engraved shadow
oxblood   #5A1F1B   marketing accent
oxblood-tint #7A2C26
slate     #3A4A5A   POS accent          ← ADD as a token
bone      #EDE7DA   body text
bone-muted #A39C8E  secondary text
```

**Type** — three roles, one addition:
- Display: **Reem Kufi** (AR) / **Fraunces** (EN) — already wired.
- Body: **IBM Plex Sans Arabic** (AR) / **Inter** (EN) — already wired.
- **ADD — Utility/data: `IBM Plex Mono`.** Used for every number, label, kicker, tracker step, price, and project `№`. It is from the same superfamily as the Arabic body face so it pairs by design, and it gives the "instrument / ledger" voice this concept needs. Load it via `next/font/google` in `src/app/[locale]/layout.tsx` alongside the existing four, expose as `--font-mono`.

**The signature element — the brass seal iris.**
The circular **الحجازي seal** from the film is the site's one recurring motif, used as an *aperture*:
- The hero video is revealed through a circular mask that grows from a small seal to full bleed.
- The diagnostic result is stamped with it.
- Section dividers are hairlines that terminate in a tiny seal tick.
- Nothing else on the site is round.

**The risk / the rule that makes this not look templated:**
**Zero border-radius anywhere except the seal circle.** No `rounded-lg`, no `rounded-2xl`, no `rounded-3xl`, no `rounded-full` except on seal elements. Every surface is a hairline-ruled rectangle. **And no `backdrop-filter` / glassmorphism anywhere** — the existing brief bans it and one current component violates it. This single pair of rules is what makes the site read as engraved metal rather than as a generic dark SaaS page.

---

## 4. Global rules for whoever executes this

1. **Read the guide before you code.** This is Next.js **16**, which differs from older versions. Before writing routing, metadata, or middleware code, read the relevant file in `node_modules/next/dist/docs/`.
2. **Every user-visible string must be bilingual.** Add the key to **both** `messages/ar.json` and `messages/en.json` and read it with `useTranslations`/`getTranslations`. Never hardcode English (or Arabic) in a component. `src/components/site/FeatureShowcase.tsx` currently violates this — it is being deleted.
3. **Arabic is the default locale and the layout is RTL.** Every horizontal offset, arrow direction, transform sign and `left/right` value must be direction-aware. Use CSS logical properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) instead of `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`.
4. **Use `m.*` from `framer-motion`, never `motion.*`.** The app wraps everything in `<LazyMotion features={domAnimation}>`, so only the `m` namespace works.
5. **Respect `prefers-reduced-motion`** in every animated component via `useReducedMotion()`. When reduced: no parallax, no auto-playing video (show the poster still instead), no scroll-driven transforms.
6. **Never animate `width`, `height`, `top`, or `left`.** Only `transform` and `opacity`, plus `clip-path` where explicitly specified.
7. **Never use `<img>` for content images** — use `next/image` with explicit `width`/`height` or `fill` + `sizes`.
8. **Colour classes come from tokens only**: `text-bone`, `text-bone-muted`, `bg-ink-900`, `border-brass/20`. Never `text-white/70` or raw hex in a class.
9. **Keyboard access is mandatory.** Anything clickable is a `<button>` or `<a>` with a visible `:focus-visible` ring in brass.
10. After each phase, run `npm run build` and fix every error before continuing.

---

## PHASE 0 — Demolition

Delete first. Everything here is dead, broken, or replaced. Deleting it makes the rest of the plan smaller and stops the executor from copying broken patterns.

### 0.1 Remove the entire database layer

**Delete these files:**
```
src/lib/mongodb.ts
src/lib/adminAuth.ts
src/app/actions/admin.ts
src/app/actions/lead.ts
src/app/actions/order.ts
src/app/actions/projects.ts
src/app/api/media/[id]/route.ts          (then delete the empty src/app/api/ tree)
src/app/admin/                            (the whole directory: layout, page, orders, leads, licenses, projects)
src/components/admin/                     (the whole directory)
```

**Then:**
- `package.json` — remove the `mongodb` dependency. Also remove `mp4box` (dead — see 0.2). Run `npm install` after.
- `src/app/robots.ts` — remove the `/admin` and `/api` disallow rules.
- `src/proxy.ts` — simplify the matcher; it no longer needs to exclude `api` or `admin`. Read `node_modules/next/dist/docs/` for the Next 16 proxy/middleware contract before editing.
- `src/config/workflow.ts` — delete `ORDER_STATUSES`. Keep `PROJECT_CATEGORIES` but rewrite it in Phase 5.

### 0.2 Remove the dead video engine

All of this is compiled but never rendered. It is the abandoned WebCodecs experiment.
```
src/lib/video/frame-decoder.ts
src/lib/video/frame-buffer.ts
src/lib/video/scroll-controller.ts
src/lib/video/canvas-renderer.ts
src/components/film/FrameScrubbedVideo.tsx
src/components/film/VideoCallbackScrub.tsx
src/components/film/VideoSeekScrub.tsx
src/components/film/HomeFilm.tsx
```
Also remove `"webworker"` from the `lib` array in `tsconfig.json`.

Keep `src/lib/video/capabilities.ts` but **rewrite it** in Phase 2.

### 0.3 Remove replaced pages and components

```
src/app/[locale]/work/page.tsx           → replaced by /projects
src/app/[locale]/start/page.tsx          → merged into /contact
src/app/[locale]/order/page.tsx          → order flow becomes WhatsApp
src/components/order/                     (whole directory)
src/components/start/                     (whole directory)
src/components/site/BelowFold.tsx        → home is rebuilt
src/components/site/FeatureShowcase.tsx  → pure placeholder, hardcoded English, uses banned backdrop-blur
src/components/site/ParallaxHero.tsx     → replaced by ParallaxCounter
src/components/site/ProductSection.tsx   → replaced by TheInstruments (it renders every string twice, once for mobile and once for desktop)
src/components/site/EcosystemStatement.tsx → replaced by TheGrid
src/components/work/                      (whole directory — AsymmetricGrid, EnhancedLightbox, HorizontalFilmstrip, ProjectCard, WorkHero; all depend on the deleted ProjectView type)
src/components/fx/CursorMagnifier.tsx    → its "magnifier" renders an empty ring; it never reads the image it is given, and it double-mounts alongside the global Cursor
```

**Also delete these orphans** (they exist but nothing imports them — an older home design):
```
src/components/site/Offerings.tsx
src/components/site/OfferingSection.tsx
src/components/site/Hero.tsx
src/components/site/HeroPanel.tsx
src/components/site/Statement.tsx
src/components/site/Stats.tsx
src/components/site/SectionDots.tsx
src/components/site/FieldSection.tsx
src/components/site/SocialAdsBand.tsx
```

### 0.4 Add redirects

In `next.config.ts`, add permanent redirects so old links don't 404:
```
/work    → /projects
/start   → /contact
/order   → /contact
/products/pos/download → /products/pos     (keep the download page only if it has real files; it does not)
```
Apply them for both `/ar/...` and `/en/...`. Read the Next 16 redirect docs first.

### 0.5 Delete unused media

```
public/films/chapters/          (all 5, ~53 MB, referenced by nothing)
public/films/home-film.mp4      (29 MB 4K master with an audio track, referenced by nothing)
public/films/home-film-poster.jpg (729 KB, passed as a prop that is never read)
public/posters/home/marketing.jpg, pos.jpg, ecommerce.jpg   (orphaned chapters)
public/shots/                    (all 12 files are 74-byte stub PNGs — they render blank)
```
Keep `videos/1.mp4` … `videos/5.mp4` (the source clips, needed in Phase 2) and `public/bg/backdrop.jpg`.

### ✅ Phase 0 check
```
npm run build
```
Must succeed with zero TypeScript errors. The site will be mostly empty — that is expected. Fix any remaining import of a deleted module.

---

## PHASE 1 — Design tokens

Everything after this reads from these tokens. **Do this before building any section.**

### 1.1 Add the mono font

In `src/app/[locale]/layout.tsx`, next to the existing four `next/font/google` calls:
```ts
import { IBM_Plex_Mono } from "next/font/google";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});
```
Add `plexMono.variable` to the `<html>` className alongside the others.

### 1.2 Extend the `@theme` block in `src/app/globals.css`

Tailwind v4 is configured CSS-first (there is no `tailwind.config`). Add to the existing `@theme` block — **do not remove anything already there**:

```css
@theme {
  /* ... keep all existing colour and font vars ... */

  /* NEW: POS accent, promoted from worlds.ts */
  --color-slate: #3a4a5a;

  /* NEW: utility / data face */
  --font-mono: var(--font-plex-mono);

  /* NEW: fluid type scale — these override Tailwind's text-* sizes */
  --text-2xs:  clamp(0.6875rem, 0.66rem + 0.14vw, 0.75rem);
  --text-xs:   clamp(0.75rem,   0.72rem + 0.16vw, 0.8125rem);
  --text-sm:   clamp(0.875rem,  0.84rem + 0.18vw, 0.9375rem);
  --text-base: clamp(1rem,      0.95rem + 0.25vw, 1.125rem);
  --text-lg:   clamp(1.125rem,  1.05rem + 0.38vw, 1.375rem);
  --text-xl:   clamp(1.375rem,  1.20rem + 0.75vw, 1.875rem);
  --text-2xl:  clamp(1.75rem,   1.40rem + 1.50vw, 2.75rem);
  --text-3xl:  clamp(2.25rem,   1.60rem + 2.80vw, 4rem);
  --text-4xl:  clamp(2.75rem,   1.70rem + 4.50vw, 6rem);
  --text-5xl:  clamp(3.25rem,   1.60rem + 7.00vw, 8.5rem);

  /* NEW: motion tokens */
  --ease-seal:  cubic-bezier(0.83, 0, 0.17, 1);   /* iris open/close */
  --ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1);
  --dur-fast:   180ms;
  --dur-base:   420ms;
  --dur-slow:   900ms;
  --dur-cinema: 1600ms;
}
```

### 1.3 Add base rules

Append to `globals.css`:
```css
/* Utility face. Arabic numerals stay in the mono face for a ledger feel. */
.font-mono, .u-data {
  font-family: var(--font-mono), ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
}

/* The one shape rule: nothing is round except the seal. */
.seal-round { border-radius: 9999px; }

/* Hairline that terminates in a seal tick — the section divider motif. */
.rule-seal {
  position: relative;
  height: 1px;
  background: color-mix(in srgb, var(--color-brass) 22%, transparent);
}
.rule-seal::after {
  content: "";
  position: absolute;
  inset-inline-start: 0;              /* RTL-aware */
  top: 50%;
  width: 7px; height: 7px;
  margin-top: -3px;
  border-radius: 9999px;
  border: 1px solid var(--color-brass);
  background: var(--color-ink-900);
}

/* Visible keyboard focus, brass, everywhere. */
:where(a, button, [tabindex]):focus-visible {
  outline: 2px solid var(--color-brass);
  outline-offset: 3px;
}
```

**Delete** the dead comment at line ~73 (`/* Custom cursor overlay ... */` with no rule after it) and delete any keyframes in `globals.css` that are no longer referenced after Phase 0 (`worldGridPan`, `worldSweep`, `worldDust`, `scanSweep`, `barGrow`, `pulseRing`, `tickerUp`, `wheelChipIn`, `drift1-3`, `float1-2` — grep each name across `src/` first and only delete the ones with zero hits).

### ✅ Phase 1 check
Add a temporary page that renders `text-2xs` through `text-5xl` and a `.rule-seal`. Confirm the sizes scale smoothly when you resize the window, and that the seal tick sits on the **right** in Arabic and the **left** in English. Delete the temp page.

---

## PHASE 2 — Video pipeline

### 2.1 The rule that fixes the bug

> **Never assign to `video.currentTime` in response to scroll. Ever.**

The video plays itself at its natural rate. Scroll only changes CSS (`clip-path`, `transform`, `opacity`) on elements *around* the video. This eliminates seeking, which eliminates both the frozen-frame bug and the lag, on every device.

### 2.2 How each video behaves

Two behaviours only:

| Behaviour | Used by | Rule |
|---|---|---|
| **Play once, hold** | Home hero (clip 1), Home CTA (clip 5) | Plays through once when it enters view, then **freezes on the final frame**. No `loop`. A very slow CSS `scale(1 → 1.04)` drift over 30s keeps the held frame alive. Costs nothing after the first play, and there is no loop seam to hide. Narratively correct — clip 1 ends by arriving in the lobby, clip 5 ends by settling into a stable aerial hover. |
| **Seamless loop** | All 5 nav-page heroes | `loop` on. The prompts in Appendix A are written so each clip **starts and ends on the same composition**. As a safety net, every looped encode gets a 0.4s fade from and to black at each end (see 2.4); since the page ground is `#0A0A0B`, black→black is an invisible seam. |

### 2.3 Encoding — run these commands

You have `ffmpeg 8.0` on PATH. Source clips are `3840×2160, 24fps, 8.000s, 192 frames`.

Create `public/films/` output. **Every command below must include `-movflags +faststart` and `-an`.** The previous encode lost both and that is half the bug.

**Landscape master (desktop), 1920×1080:**
```bash
ffmpeg -y -i videos/1.mp4 \
  -an -c:v libx264 -preset slow -crf 24 \
  -profile:v main -level 4.0 -pix_fmt yuv420p \
  -vf "scale=1920:1080:flags=lanczos" \
  -g 48 -keyint_min 24 -sc_threshold 0 \
  -maxrate 3500k -bufsize 7000k \
  -movflags +faststart \
  public/films/hero-intro.mp4
```

**Portrait mobile, 1080×1920** — crop the 16:9 frame to 9:16 **keeping the composition's subject**. Clip 1 keeps the tower centred, so a centre crop is correct; for other clips adjust `x` as noted in Appendix A:
```bash
ffmpeg -y -i videos/1.mp4 \
  -an -c:v libx264 -preset slow -crf 26 \
  -profile:v main -level 3.1 -pix_fmt yuv420p \
  -vf "crop=1215:2160:1313:0,scale=1080:1920:flags=lanczos" \
  -g 48 -keyint_min 24 -sc_threshold 0 \
  -maxrate 1800k -bufsize 3600k \
  -movflags +faststart \
  public/films/hero-intro-portrait.mp4
```
> `crop=1215:2160:1313:0` takes a full-height 9:16 slice from the centre of a 3840-wide frame. To shift the crop, change the `1313` x-offset (0 = far left, 2625 = far right).

**Poster — must be frame 0 exactly**, so there is no flash when the video starts:
```bash
ffmpeg -y -i public/films/hero-intro.mp4 -vf "select=eq(n\,0)" -vframes 1 -q:v 3 public/films/hero-intro.jpg
ffmpeg -y -i public/films/hero-intro-portrait.mp4 -vf "select=eq(n\,0)" -vframes 1 -q:v 3 public/films/hero-intro-portrait.jpg
```

**For looped videos only**, add fades to the filter chain before `scale`:
```
-vf "fade=t=in:st=0:d=0.4,fade=t=out:st=7.6:d=0.4,scale=1920:1080:flags=lanczos"
```

**Repeat for clip 5** → `hero-outro.mp4` / `hero-outro-portrait.mp4` / posters. Clip 5's reserved space is the **bottom-right**, and the tower sits upper-left, so use x-offset `0` for the portrait crop to keep the tower in frame.

**Budget — verify after every encode:**
| File | Max size |
|---|---|
| any landscape `.mp4` | **4.0 MB** |
| any portrait `.mp4` | **2.0 MB** |
| any poster `.jpg` | **180 KB** |

If a file is over budget, raise `-crf` by 2 and re-run. Verify with:
```bash
ffprobe -v error -show_entries format=size,duration,bit_rate -show_entries stream=width,height,codec_name -of default=nw=1 public/films/hero-intro.mp4
```

### 2.4 Confirm faststart actually applied

This is the check that was missed last time:
```bash
ffprobe -v trace -i public/films/hero-intro.mp4 2>&1 | grep -m4 "type:'"
```
The output must show `type:'moov'` **before** `type:'mdat'`. If `mdat` comes first, faststart did not apply — re-run the encode.

### 2.5 Fix the cache headers

`next.config.ts` currently sets `max-age=31536000, immutable` on `/films/:path*` with **non-hashed filenames**, which is why re-encodes never reached browsers. Change to:
```
Cache-Control: public, max-age=3600, stale-while-revalidate=86400
```
Only make it `immutable` if you start putting a hash in the filename.

### 2.6 Rewrite `src/lib/video/capabilities.ts`

Delete `detectBackend` (dead) and the render-time `isMobileDevice()` (it reads `window` during render, which risks a hydration mismatch). Replace with:

```ts
"use client";
import { useEffect, useState } from "react";

/** True when the device/user/network says: do not autoplay heavy video. */
export function useVideoAllowed(): boolean { /* ... */ }

/** True when the viewport is portrait-ish. SSR-safe: returns false on the
 *  server and on the first client render, then updates in an effect.
 *  Uses matchMedia("(max-aspect-ratio: 4/5)") and listens for changes. */
export function useIsPortrait(): boolean { /* ... */ }
```
`useVideoAllowed` returns `false` when any of these is true: `prefers-reduced-motion: reduce`, `navigator.connection.saveData`, `effectiveType` is `2g`/`slow-2g`, or `downlink < 1.0`. Both hooks must return a stable value on the first render so server and client HTML match.

### 2.7 Build `src/components/film/AmbientFilm.tsx`

**This one component replaces the entire deleted film system.** Every video on the site uses it.

```tsx
"use client";

export type AmbientFilmProps = {
  /** Landscape source, e.g. "/films/hero-intro.mp4" */
  src: string;
  /** Portrait source, e.g. "/films/hero-intro-portrait.mp4" */
  srcPortrait: string;
  /** Poster for src (frame 0). Portrait poster is derived by convention. */
  poster: string;
  posterPortrait: string;
  /** "hold" = play once then freeze. "loop" = loop forever. */
  mode: "hold" | "loop";
  /** Above-the-fold videos get "eager": they preload and start immediately.
   *  Everything else gets "lazy": src is not attached until within 1 viewport. */
  priority?: "eager" | "lazy";
  className?: string;
};
```

**Required implementation rules:**

1. **Attributes:** `muted playsInline autoPlay={false} disablePictureInPicture disableRemotePlayback` plus `poster={...}`, and `preload={priority === "eager" ? "auto" : "none"}`.
   `muted` **must be set as a DOM property in an effect as well as a JSX attribute** (`video.muted = true`) — some mobile browsers ignore the attribute and then refuse to autoplay.
2. **Lazy attach:** for `priority="lazy"`, do not set `video.src` at all until an `IntersectionObserver` with `rootMargin: "100% 0px"` fires. This is what stops two videos downloading at once.
3. **Play/pause gating:** a second `IntersectionObserver` with `threshold: 0.1` on the video's own wrapper. On enter → `video.play().catch(() => {})`. On exit → `video.pause()`. Also pause on `document.visibilitychange` when hidden. **Do not observe a 160vh outer section** — the old code did that and the section counted as "visible" for 260vh of scroll.
4. **`mode: "hold"`:** listen for `ended`; on `ended` set a state flag and add a class that starts the 30s `scale` drift. Do **not** set `loop`.
5. **`mode: "loop"`:** set `loop` on the element. Nothing else.
6. **Source choice:** `const isPortrait = useIsPortrait()`. Pick `srcPortrait`/`posterPortrait` when portrait. When `isPortrait` changes, update `video.src` **only if it actually changed** (guard with `if (video.currentSrc !== resolved)`), then call `video.load()`. The old code re-`load()`ed on every effect re-run, which is where the "4+ mounts" bug came from.
7. **No `requestAnimationFrame` loop at all.** If you write `requestAnimationFrame` in this file, you have done it wrong.
8. **Reduced motion / disallowed:** when `useVideoAllowed()` is `false`, render only the `poster` via `next/image` with `fill` and `priority` matching. Never mount a `<video>` element in that case.
9. **Effect dependencies:** never put an inline callback prop in a dependency array. Store callbacks in a `useRef` and read `ref.current` inside the effect. This is the exact bug that caused the remount loop.
10. **Cleanup:** disconnect both observers, remove the `visibilitychange` listener, and set `video.src = ""` + `video.load()` on unmount so the download is cancelled.

### 2.8 Build `src/components/film/SealIris.tsx`

The signature reveal. Wraps `AmbientFilm`.

- A `position: sticky; top: 0; height: 100svh` stage inside a track section (**`120vh`**, not 160vh — the old value gave only 60vh of usable travel).
- `useScroll({ target: trackRef, offset: ["start start", "end end"] })`.
- Drive a `clip-path: circle(R at 50% 45%)` on the video wrapper, where `R` goes `8vmax → 150vmax` over the first 35% of progress, using `--ease-seal`.
- Behind the circle, a 1px brass ring at exactly the circle's radius, fading out as the circle grows past 60vmax.
- Apply all scroll-driven values with `useMotionValueEvent` writing directly to `element.style` — **do not** put scroll values into React state.
- Under `prefers-reduced-motion`, skip the mask entirely: render the video at full bleed immediately.

### ✅ Phase 2 check
- `ffprobe` confirms `moov` before `mdat` on all four home video files.
- All files inside the size budget.
- Open the home page on a throttled "Slow 4G" profile in DevTools: the poster appears instantly, the video starts within ~2s, and **there is not a single seek** in the network waterfall (no repeated 206 range requests once loaded).
- Scroll rapidly up and down through the hero 10 times. The video never freezes on a stale frame.
- Open Chrome Performance panel while scrolling. There must be **no long tasks over 50ms** attributable to video.

---

## PHASE 3 — Home page

New file `src/app/[locale]/page.tsx` renders nine components in this order. Each section is its own file under `src/components/home/`.

**Loading strategy:** sections 1 and 2 are imported normally (above the fold). Sections 3–9 are imported with `next/dynamic`, **but with `ssr: true`** — the old page used `ssr: false` for the entire below-fold content, which made it invisible to search engines. Add `className="section-lazy"` (already defined in `globals.css`) to sections 5 onward.

---

### 3.1 — HERO — `HomeHero.tsx`

Clip 1 (`hero-intro.mp4`), `mode="hold"`, `priority="eager"`, wrapped in `SealIris`.

- Copy sits in the **centre** of the frame — that is the clip's reserved clear zone. Do not move it.
- `Home.headlineLine1` on one line, `Home.headlineLine2` on the next with the existing `.text-mask` brass shimmer class.
- `Home.lead` below, `max-width: 46ch`.
- Two actions: `Home.cta` → `/contact` (solid brass), `Home.ctaWhatsapp` → `wa.me` link (hairline outline).
- A `.rule-seal` divider under the actions.
- Bottom of the stage: the scroll cue — a 1px vertical brass line, 48px tall, whose `scaleY` animates 0→1→0 on a 2.4s loop, with `Film.scroll` in mono caps beside it. It fades out permanently once `scrollY > 40`.
- **Mobile:** the portrait video fills the screen; the copy block sits at 38% from the top, not centred, so the tower stays visible above it. Reduce the headline to `text-3xl`.

---

### 3.2 — THE DIAGNOSTIC — `Diagnostic.tsx`

The most useful section on the site. Three tap-only questions → a concrete answer.

**Behaviour:**
- One question visible at a time. Progress shown in mono as `٢ من ٣` (AR) / `2 of 3` (EN).
- Each answer is a large hairline-bordered rectangle — minimum tap target **64px tall**, full width on mobile, 3-across on desktop. Selecting one advances immediately (no "Next" button).
- A back control returns to the previous question and preserves the answer.
- Transitions between questions: the outgoing block translates 24px and fades over `--dur-base`; the incoming does the reverse. `AnimatePresence mode="wait"`.

**The questions** (add all copy to both message files under a new `Diagnostic` namespace):

| # | Question | Answers |
|---|---|---|
| 1 | Do you have a shop right now? | One branch / More than one branch / Online only / Nothing yet |
| 2 | What's the biggest problem? | I don't know my numbers / Nobody knows me / I can't sell online / All of them |
| 3 | When do you want to start? | This month / Within 3 months / Just exploring |

**The result:**
A stamped panel with the seal motif. It shows, all in mono except the recommendation title:
- `إنت محتاج:` + the recommended combination (one or more of: نظام نقاط البيع / متجر إلكتروني / تسويق رقمي)
- `التكلفة تقريبًا:` a price range
- `المدة:` a duration range
- Two actions: **`ابعت لنا على واتساب →`** (primary) and a text link to the recommended product page.

**The recommendation logic** lives in `src/config/diagnostic.ts` as pure data — a plain array of rules, so the owner can edit it without touching a component:
```ts
export type DiagnosticOutcome = {
  id: string;
  products: ("pos" | "ecommerce" | "marketing")[];
  priceFromEGP: number;      // owner edits these
  weeksMin: number;
  weeksMax: number;
};
/** Keyed by `${q1}-${q2}-${q3}`, with a `*` wildcard fallback per position. */
export const diagnosticRules: { match: string; outcome: string }[] = [ /* ... */ ];
export const diagnosticOutcomes: Record<string, DiagnosticOutcome> = { /* ... */ };
```
Provide a sensible full rule set covering all 4×4×3 = 48 combinations using wildcards (e.g. `"1-*-*"` → pos-led). **Every price and duration in this file gets an `// OWNER: edit` comment.**

**The WhatsApp hand-off** — build the message from the three answers so the owner receives context:
```
مرحبًا، جاوبت على الأسئلة في الموقع:
• عندي: فرع واحد
• المشكلة: مش عارف أرقامي
• أبدأ: الشهر ده
الاقتراح: نظام نقاط بيع + متجر
```
`encodeURIComponent` it into `https://wa.me/{siteConfig.contact.whatsapp}?text=...`.
**Render this as a real `<a href>`, not `window.open()` after an `await`** — the old form used `window.open` in an async handler, which iOS Safari blocks as a popup.

---

### 3.3 — PARALLAX 1: THE COUNTER — `ParallaxCounter.tsx`

Full-bleed image with layered parallax and four interactive hotspots.

- Image: `public/bg/counter.jpg` (generate with the prompt in **Appendix B.1**). Use `next/image` with `fill`, `sizes="100vw"`, `quality={82}`, `priority={false}`.
- Section height `100svh` minimum, `overflow: hidden`.
- Parallax: `useScroll({ target, offset: ["start end", "end start"] })` → image `y: 0% → -14%` and `scale: 1.12 → 1.0`. Add `.parallax-layer` (already in `globals.css`). Zero this out under reduced motion.
- A second layer above the image: a radial ink vignette at 55% opacity so text stays legible.

**The smart part — four hotspots.** Each is a small brass ring (`.seal-round`, 22px) positioned in percentages over the image, pulsing slowly. Tap/hover opens a small hairline panel next to it. On mobile, hotspots are tap-only and the panel opens as a bottom sheet.

| Hotspot | Position (%) | Reveals |
|---|---|---|
| The POS screen | 38 / 42 | "This screen is our own system. It runs our shops before it runs yours." |
| The receipt printer | 62 / 55 | "Every sale, every return, every shift — printed and recorded." |
| The ledger notebook | 24 / 68 | "We replaced this. That's why we know what it needs to do." |
| The oak counter | 76 / 78 | "We make the furniture too. That's not a metaphor." |

All eight strings (title + body per hotspot) go into the `Counter` namespace in both message files. Positions live in a `HOTSPOTS` constant at the top of the file so they can be nudged after the image is generated.

**Accessibility:** each hotspot is a `<button>` with `aria-expanded` and an `aria-controls` pointing at its panel; `Escape` closes.

---

### 3.4 — THE INSTRUMENTS — `Instruments.tsx`

The three products, each presenting itself through its own artifact. **This replaces the three identical stacked product blocks.**

**Structure:** a track section, `height: 340vh`. Inside, a `sticky top-0 h-screen` stage. Three panels stack: as scroll progresses, panel N+1 slides up over panel N; panel N scales to `0.94` and dims to `opacity: 0.35`. Driven entirely by `useMotionValueEvent` writing to `style`, never React state.

Each panel: left half (RTL: right half) is the instrument; other half is the copy — a number in mono (`٠١`), title in display face, one promise line, four capability lines, and a text link to the product page. Copy comes from the existing `Offerings.{pos,ecommerce,marketing}` namespace, which is already fully written in both languages.

**Panel 1 — POS (accent `slate`).** The instrument is an **invoice that prints itself**. A narrow paper-white column; as the panel becomes active, capability lines type in one at a time as invoice line items in mono, right-aligned Arabic, each with a dotted leader to a `٠٠.٠٠` price. It ends with a dashed rule and a total line reading the product's headline stat. Implemented as a staggered opacity+translateY reveal on a `<ul>`, not a real typewriter — cheaper and reads the same.

**Panel 2 — E-commerce (accent `oxblood`).** The instrument is a **product page assembling itself**. Elements fly into place in order — image frame, then title, then price, then variant chips, then the add-to-cart bar — and as each lands, a hairline connector draws from it to a small mono label naming the capability it represents ("3D preview", "room planner", "5 payment gateways"). Reuse a poster still or `public/posters/home/ecommerce.jpg` as the product image.

**Panel 3 — Marketing (accent `oxblood-tint`).** The instrument is an **ad results panel**. A 9:16 frame plays a short reel (use `hero-outro-portrait.mp4` as a stand-in until a real one exists) beside four metrics whose numbers count up from zero when the panel activates: reach, ROAS, cost per result, and brands. Numbers in mono, tabular figures, so they don't jitter while counting.

**Mobile:** the stacking behaviour is too heavy for phones. Below `640px`, render the same three panels as a simple vertical sequence with each instrument animating on entry via `useInView`. **Write the markup once** and branch only the animation wiring — the deleted `ProductSection` rendered every string twice, once for mobile and once for desktop, and that must not be repeated.

---

### 3.5 — PARALLAX 2: THE GRID — `ParallaxGrid.tsx`

Overhead specimen tray. This is where "everything connects" gets *shown* rather than stated.

- Image: `public/bg/grid.jpg` (**Appendix B.2**) — a flat overhead photograph of eight objects the company produces, arranged on dark felt like a museum specimen tray.
- Parallax: the image gets a gentle `scale: 1.0 → 1.06` and `y: 0% → -8%`. Slower than section 3.3 so the two don't feel like the same effect.
- Copy overlays the top-left (RTL: top-right): the `Ecosystem` namespace headline, which already exists in both languages.

**The smart part.** Each of the eight objects has an invisible hit area (percentage-positioned `<button>`). On tap/hover:
1. A mono label appears beside the object naming it.
2. A hairline in the owning world's accent colour draws from the object to a small fixed legend at the bottom of the section, landing on the pill for **نقاط البيع** / **المتجر** / **التسويق**. The line is an inline `<svg>` `<path>` animated with `stroke-dashoffset`.
3. That pill lights in its accent colour.

Objects and their owner: thermal receipt → POS; barcode label → POS; tape measure → POS; phone with a reel → Marketing; printed ad card → Marketing; fabric swatch → E-commerce; a chair leg → E-commerce; a brass key with the seal → all three (three lines draw at once — this is the payoff).

Positions in a `GRID_OBJECTS` constant so they can be adjusted after the image is generated. All labels bilingual under a `Grid` namespace.

---

### 3.6 — THE TRACKER — `Tracker.tsx`

The process, presented as the package-tracking strip every Egyptian customer already understands.

- A horizontal rail across the section (vertical below `640px`), drawn as a 1px brass line whose brass fill grows left-to-right (RTL: right-to-left) tied to `scrollYProgress`.
- Four stops: **اكتشاف · إبداع · إطلاق · نمو**. Each is a `.seal-round` node on the rail. As the fill passes a node, it "completes": the ring fills brass and a check mark strokes in.
- Under each node in mono: the real elapsed time (`أول ٣ أيام`, `الأسبوع ١–٢`, `الأسبوع ٣`, `مستمر`) and one short line about what happens.
- Above the rail, a mono status line that updates as you scroll: `الحالة: قيد التنفيذ` → `تم التسليم`.
- Copy under a new `Tracker` namespace, both languages. Durations get `// OWNER: edit` comments in the message files.

---

### 3.7 — SELECTED — `SelectedWork.tsx`

Three tall expanding panels — **exactly the same interaction language as the projects page**, so the projects page feels familiar when reached. Reuse the `<ExpandingPanels />` component built in Phase 4; pass it `projects.filter(p => p.featured).slice(0, 3)`.

Below the panels, one wide hairline action: `شوف كل المشاريع →` → `/projects`.

---

### 3.8 — CTA — `HomeCta.tsx`

Clip 5 (`hero-outro.mp4`), `mode="hold"`, `priority="lazy"`.

- **Copy sits in the bottom-right quarter.** That is the clip's reserved clear zone and the tower occupies the upper-left two-thirds. On RTL this is *still* bottom-right — do not mirror it, because the mirror would put text on the tower. Use a physical `right` value here with an explicit comment saying why.
- `CTA.title`, `CTA.subtitle`, then `CTA.primary` → `/contact` and `CTA.whatsapp` → `wa.me`.
- **Mobile:** portrait crop, copy in the lower third.
- No `SealIris` here — this section instead applies a slow letterbox close: two ink bars grow from top and bottom to 12vh each over the last 30% of scroll, so the film "ends".

### ✅ Phase 3 check
- Switch to `/en` and back to `/ar`. **Zero English strings appear on the Arabic page** and vice versa. Grep the new components for any bare quoted Latin/Arabic text — there must be none.
- Every section is a visually different structure from every other section. If two look alike, one is wrong.
- Lighthouse on mobile emulation: LCP under 2.5s, CLS under 0.05, zero long tasks over 100ms.
- Toggle "Reduce motion" in the OS. Nothing autoplays, nothing parallaxes, everything is still readable and every hotspot still opens.
- Tab through the whole page with the keyboard. Every interactive element is reachable and shows a brass focus ring.

---

## PHASE 4 — Projects page (`/projects`)

### 4.1 The data file — `src/config/projects.ts`

Hardcoded. No database. Typed, with a clear comment block at the top telling the owner how to add a project.

```ts
export type ProjectMetric = {
  value: string;                  // "+180%"  — keep as a string, some are "3.2x"
  label: { ar: string; en: string };
};

export type Project = {
  id: string;                     // url-safe, unique, e.g. "maktabet-al-nour"
  num: string;                    // "01" — displayed, controls order
  featured: boolean;              // true → also shown on the home page
  title: { ar: string; en: string };
  client: { ar: string; en: string };
  year: number;
  category: ProjectCategory;      // see below
  services: { ar: string; en: string }[];   // 2–4 short chips
  summary: { ar: string; en: string };      // one line, max ~90 chars
  body: { ar: string; en: string };         // 2–4 sentences
  metrics: ProjectMetric[];       // 2–4
  images: string[];               // "/projects/<id>/01.jpg" — first is the panel image
  link?: string;                  // live URL, optional
};

export type ProjectCategory = "pos" | "ecommerce" | "marketing" | "brand" | "video" | "furniture";
```

Rewrite `PROJECT_CATEGORIES` in `src/config/workflow.ts` to match this union, or move it into `projects.ts` and delete `workflow.ts` entirely (it has nothing else left after Phase 0).

**Seed with 2 sample projects** marked clearly:
```ts
// ─────────────────────────────────────────────────────────────
// OWNER: Add your real projects below. Copy an existing block.
// Images go in public/projects/<id>/ — first image is the panel cover.
// The two entries below are SAMPLES. Delete them when you add real work.
// ─────────────────────────────────────────────────────────────
```
Also export helpers used by the pages:
```ts
export const projects: Project[];
export function getFeaturedProjects(count?: number): Project[];
export function getProjectCategories(): ProjectCategory[];   // only ones actually used
```

### 4.2 `ExpandingPanels.tsx` — the interaction

Built once in `src/components/projects/`, used by both `/projects` and the home page's Selected section.

**Desktop (`>= 1024px`):**
- A flex row filling `100svh`. Each project is one panel.
- Collapsed panel: `flex: 1`. Open panel: `flex: 6`. Transition `flex-grow` — this is the one exception to "never animate layout properties", because it is the whole point of the interaction. Keep the panel count low (paginate at 8) so the layout cost stays trivial. Use `--dur-base` with `--ease-out-soft`.
- **Collapsed panel contents:** the cover image at `opacity: 0.3`, a 1px brass divider on the leading edge, and the project `№` plus the client name **rotated 90°** running up the panel in mono. Nothing else.
- **Open panel contents:** cover image at full opacity with an ink gradient scrim on the bottom half, then in the lower area — year · category in mono, the title in the display face, the summary, the service chips, the metrics as large mono numbers with small labels, and two actions: `التفاصيل` (expands the body text in place) and `زيارة الموقع →` when `link` exists.
- Opens on **hover** after a 90ms delay (prevents flicker while sweeping across), and locks open on **click**. Arrow keys move between panels; `Home`/`End` jump to first/last. In RTL the arrow key directions invert.
- **Image loading:** only the open panel's cover uses `next/image` with `quality={85}`; collapsed panels use `quality={45}` and `sizes="15vw"`. Only the open panel loads images 2+.

**Mobile (`< 1024px`):**
- The same panels stacked vertically as horizontal bars, each `86px` tall showing cover image at 30%, `№`, client and title.
- Tapping expands it **downward in place** with a `height: auto` animation, revealing the cover image, metrics, body and actions. Only one open at a time. The page scrolls the newly opened panel into view.
- Use `AnimatePresence` + `m.div` with `initial/animate/exit` on `height`. This is the one place `height` may be animated; keep the content inside a fixed-position wrapper so text does not reflow during the animation.

**Both:** the whole thing is one `<ul>` of `<li>`s containing `<button>`s. Each button has `aria-expanded`. Under reduced motion, transitions become instant.

### 4.3 The page — `src/app/[locale]/projects/page.tsx`

Order:
1. **Video hero** — `AmbientFilm mode="loop"` with `/films/page-projects.mp4` (**Appendix A.4**), short: `70svh`. Copy in the reserved zone. A mono counter showing the real project count from `projects.length` — **do not add anything to it**; the deleted hero inflated its count by 3.
2. **Filter rail** — a single horizontal row of hairline category chips derived from `getProjectCategories()`. Only render the rail if there are more than 2 categories. Selecting a chip filters the panels with a `layout` transition.
3. **`<ExpandingPanels />`** with the filtered set.
4. **Pagination** — `PAGE_SIZE = 8`. Below the panels, a mono pager: `٠١ / ٠٣` with previous/next hairline buttons. It swaps the visible slice; it does **not** navigate, so nothing reloads. Scroll position returns to the top of the panels on page change.
5. **`CtaBand`** (the existing component, kept).

Add `Projects` namespace copy to both message files: hero kicker/title/subtitle, the count label, `all` filter label, each category label, the pager labels, and the two panel action labels.

### 4.4 Images

Create `public/projects/<id>/01.jpg` … for each sample. Until real photos exist, generate placeholders with the prompt in **Appendix B.3**. Target **≤ 220 KB each**, 1600px on the long edge. If a project has no images, `ExpandingPanels` must render a brass-hairline ink panel with the seal at 6% opacity — never a broken image.

### ✅ Phase 4 check
- With 2 sample projects, the desktop row shows 2 panels and opening one works.
- Temporarily duplicate the samples to 12 entries: pagination appears, shows 2 pages, and the row still opens smoothly. Then remove the duplicates.
- On a phone viewport, tapping a bar expands it downward and only one is open at a time.
- Delete all `images` from one sample: the panel renders the seal fallback, no broken image icon.

---

## PHASE 5 — Nav page video heroes

Every nav page gets the same hero treatment. Build one shared component and reuse it — **do not** write five near-identical heroes.

### 5.1 `src/components/site/PageHero.tsx`

```tsx
type PageHeroProps = {
  videoKey: "marketing" | "pos" | "ecommerce" | "projects" | "contact";
  kicker: string;
  title: string;
  subtitle: string;
  /** Which quarter of the frame the copy sits in — matches each clip's
   *  reserved clear zone. See Appendix A. */
  zone: "bottom-left" | "bottom-right" | "center" | "bottom-center";
  actions?: React.ReactNode;
};
```
- Height: `72svh` on desktop, `64svh` on mobile (heroes on inner pages must not eat the whole screen).
- `AmbientFilm mode="loop" priority="eager"` with `/films/page-{videoKey}.mp4` and `/films/page-{videoKey}-portrait.mp4`.
- An ink scrim gradient anchored to the copy's zone, so text is legible without dimming the whole frame.
- The copy block fades and lifts 20px on mount, then a `.rule-seal` under it.
- **`zone` must map to physical corners, not logical ones** — the videos are composed with a specific dark corner, and mirroring for RTL would put text over the bright subject. Add a comment saying exactly this.

### 5.2 Wire it into the four existing pages plus projects

| Page | File | videoKey | zone |
|---|---|---|---|
| Marketing | `src/app/[locale]/services/marketing/page.tsx` | `marketing` | bottom-left |
| POS | `src/app/[locale]/products/pos/page.tsx` | `pos` | bottom-right |
| Store | `src/app/[locale]/products/ecommerce/page.tsx` | `ecommerce` | bottom-left |
| Projects | `src/app/[locale]/projects/page.tsx` | `projects` | bottom-center |
| Contact | `src/app/[locale]/contact/page.tsx` | `contact` | center |

Replace whatever hero markup each page currently has. Leave the rest of those pages alone — their content sections are out of scope for this plan.

### 5.3 Navbar and Footer

`src/components/site/Navbar.tsx` — change the links array to:
```ts
const links = [
  { href: "/services/marketing", label: t("marketing") },
  { href: "/products/pos",       label: t("pos") },
  { href: "/products/ecommerce", label: t("ecommerce") },
  { href: "/projects",           label: t("projects") },   // NEW key
  { href: "/contact",            label: t("contact") },    // was footer-only
];
```
Add `Nav.projects` to both message files (`مشاريعنا` / `Projects`). `Nav.work` becomes unused — delete the key from both files.

`src/components/site/Footer.tsx` — replace `/work` with `/projects` in the Explore column. Remove `/start` if referenced anywhere.

`src/app/sitemap.ts` — replace `/work`, `/start`, `/order`, `/products/pos/download` with `/projects`. This list is hand-maintained; note that in a comment.

### ✅ Phase 5 check
- Visit all five pages. Each hero video autoplays, loops **without a visible jump at the seam**, and the copy sits over dark frame area — not over the tower, a face, or a highlight.
- Rotate a phone between portrait and landscape on each hero: the source swaps and playback continues, with no reload flash.
- Nav shows 5 links + the CTA button in both languages, and does not wrap on a 360px-wide phone (use the existing mobile overlay menu).

---

## PHASE 6 — Contact page

One page that both converts and informs. Replaces `/contact`, `/start` and `/order`.

`src/app/[locale]/contact/page.tsx`, in order:

1. **`<PageHero videoKey="contact" zone="center" />`** at `64svh`.
2. **The form — `ContactForm.tsx`.** Styled as an **order slip**: a single hairline-ruled column, each field a labelled row with a dotted leader, all labels in mono caps. No rounded inputs, no shadows, no glass.
   - Fields: `الاسم`, `رقم الواتساب أو الإيميل`, service chips (multi-select: إعلانات · تصوير · فيديو · هوية · متجر · نقاط بيع), budget chips (single-select, 4 ranges), timing chips (single-select: الشهر ده · خلال ٣ شهور · بستكشف), and a message textarea.
   - **Validation before submit:** name non-empty; contact matches either an Egyptian phone shape or an email. Show the error inline, in `oxblood-tint`, tied to the field with `aria-describedby` and `aria-invalid`.
   - Chips are `<button type="button">` with `aria-pressed` — the old form omitted this.
   - **Submit is an `<a>`, not a handler.** Build the `wa.me` href reactively from current state so the browser treats the tap as a direct navigation. There is no database and no server action; the form's only job is to compose a good WhatsApp message. Show a small mono line under the button: `هيفتح واتساب برسالة جاهزة` / `Opens WhatsApp with your message ready`.
   - Separator between services must be locale-aware — `، ` for Arabic, `, ` for English. The old form hardcoded the Arabic comma in both languages.
3. **Direct channels.** Four hairline rows, not cards: WhatsApp (primary, brass border and a filled seal dot), Email, Instagram, Facebook. Values forced `dir="ltr"`. Read from `siteConfig`.
   > **`src/config/site.ts` currently holds placeholders** — `whatsapp: "201000000000"`, `email: "hello@elhegazi.com"`, `phoneDisplay: "+20 100 000 0000"`, and guessed social URLs. Add a loud `// OWNER: REPLACE THESE BEFORE LAUNCH` comment block above them. Do not invent real-looking values.
4. **Hours and location** — one mono line each, from `Contact.hours` and `siteConfig.contact.location`.
5. **A closing seal** — the الحجازي seal at 8% opacity, centred, with `Contact.briefTitle` beneath it.

Delete the now-unused `Start` and `Order` namespaces from both message files. Extend the `Contact` namespace with every new label above, in both languages.

### ✅ Phase 6 check
- Fill the form on a real phone. Tapping submit opens WhatsApp directly with the message pre-filled and correctly line-broken. (The old implementation used `window.open` after an `await`, which iOS Safari blocks — verify this one does not.)
- Submit with an empty name: an inline error appears, focus moves to the field, and the link does not fire.
- Switch to English: the service list separator is `, ` not `، `.

---

## PHASE 7 — Final pass

1. **Copy audit.** Grep every new component for string literals. Any user-visible text not coming from `useTranslations` is a bug.
2. **Token audit.** Grep for `rounded-`, `backdrop-blur`, `text-white`, `bg-white`, and raw `#` hex in `className`. Every hit outside a `.seal-round` element is a bug.
3. **Motion audit.** Grep for `requestAnimationFrame` across `src/`. After this rebuild there should be very few. Note that `src/lib/scrollSections.ts` registers `mousemove` and a **non-passive** `mousedown` listener at module scope that can never be removed — if nothing imports it after Phase 0, delete the file; if something still does, make the listeners passive and lazily registered.
4. **Cursor.** `src/components/fx/Cursor.tsx` stays as the single global cursor (mounted via `Overlays`). Confirm `CursorMagnifier` is gone and there is exactly one custom cursor on every page.
5. **Grain cost.** `FilmGrain` is a fixed full-screen `mix-blend-soft-light` layer composited over every video frame, which is measurable on mobile GPUs. Add `@media (max-width: 640px) { display: none }` to it, or drop its opacity to `0.02` on small screens.
6. **Bundle.** Run `npm run build` and check the route sizes. If the home page's first-load JS exceeds **200 KB gzipped**, move the heaviest below-fold section to `next/dynamic`.
7. Delete `docs/HOMEFILM-PERF-PLAN.md` — it documents an architecture that no longer exists and will mislead the next person. Update `docs/home-film-prompts.md` with a header noting that scroll-scrubbing was abandoned, so nobody re-encodes with `-g 1` again.

---

## Verification — the whole site

Run these in order. Do not report the work as done until every one passes and you have seen the output.

```bash
npm run build          # must be zero errors and zero type errors
npm run lint           # must be clean
npm run dev
```

Then, manually:

| # | Check | Pass condition |
|---|---|---|
| 1 | Load `/` on desktop, scroll top→bottom→top three times fast | No video ever freezes on a stale frame. No stutter. |
| 2 | DevTools → Performance, record the same scroll | No long task over 50ms. Frame rate stays above 50fps. |
| 3 | DevTools → Network, throttle to Slow 4G, hard reload `/` | Posters visible immediately. Total transfer for first viewport under 1.5 MB. Only ONE video downloading at a time. |
| 4 | Real Android phone and real iPhone, `/` | Both hero videos autoplay. Neither shows a black box or a play button. |
| 5 | `ffprobe -v trace` on every file in `public/films/` | `moov` appears before `mdat` in all of them. |
| 6 | Toggle OS "Reduce motion", reload `/` | No video plays; posters shown; page fully readable; all hotspots still open. |
| 7 | Visit every page in `/ar` then every page in `/en` | Zero mixed-language strings. Every arrow, offset and rule points the correct way in RTL. |
| 8 | Keyboard-only pass on `/`, `/projects`, `/contact` | Everything reachable, brass focus ring always visible, Escape closes every panel. |
| 9 | `/projects` with 2 projects, then temporarily 12 | Panels open smoothly in both cases; pagination appears at 9+. |
| 10 | `/contact` form on a real phone | WhatsApp opens with the message pre-filled. |
| 11 | Grep `src/` for `mongodb`, `getMongo`, `currentTime =`, `ProjectView` | Zero hits. |
| 12 | Resize the window from 320px to 2560px on every page | No horizontal scrollbar at any width. No text clipped. |

---

# Appendix A — Video generation prompts

Five new videos, one per nav page. Generate with Veo/Flow (or equivalent): produce a **START keyframe** and an **END keyframe** as stills first, then feed both plus the motion prompt to the video model.

**Rules that apply to every prompt below:**
- **Duration ~8s, 24fps, 16:9.** Also render or crop a **9:16** version.
- **Loopable:** the END frame must be visually identical to the START frame, so the clip loops invisibly.
- **Palette, every time:** near-black ink `#0A0A0B`, brass-gold `#C9A86A` with highlights `#E8D6A8`, deep oxblood `#5A1F1B`. No other hues.
- **No readable text of any kind in frame** — any UI shown must be abstract shapes. No logos except the brass الحجازي seal.
- **The reserved clear zone must stay dark, empty and low-detail** — no bright highlights, faces, or props inside it. The website's headline sits there.
- Slow, weighted, cinematic camera. Shallow depth of field. Fine film grain. Volumetric light.

**The seal, for reference in any prompt that needs it:** *a circular emblem like a wax seal struck in polished brass with fine engraving; at its centre the Arabic word الحجازي in elegant Diwani/Thuluth calligraphy, slightly raised, catching a warm specular highlight; a thin concentric ring frames the word with tiny geometric Islamic guilloche detailing around the rim. It reads as a heritage maker's mark, not a corporate logo.*

---

### A.1 — Marketing page — reserved zone: **BOTTOM-LEFT**

> **START / END frame.** A dark creative studio at night, shot from a low three-quarter angle. A tall curved wall of suspended screens and hanging printed posters glows in the upper-right two-thirds of the frame — abstract fashion and product imagery in brass-gold and deep oxblood, no readable text. In the foreground, the silhouette of a cinema camera on a tripod and the ring of a softbox read as pure dark shapes. Fine gold particles hang suspended in the air, catching light. Thin ribbons of oxblood-red light `#7A2C26` trace upward along the wall like slow rising graphs. Near-black ink palette carved by volumetric brass light. Shallow depth of field, 35mm, fine film grain. **COMPOSITION CRITICAL: the entire bottom-left quarter of the frame is empty, unlit studio floor falling into deep shadow — no props, no highlights, no particles there.**
>
> **MOTION.** A slow, weighted lateral dolly to the right of about 30cm, while the screens on the wall cross-dissolve through three different abstract campaign images and the suspended gold particles drift gently upward. The camera eases to a stop and drifts back to its exact starting position, so the first and last frames match. No cuts. No zoom.
>
> **Portrait crop:** shift the crop right — keep the screen wall filling the upper two-thirds and the empty floor in the lower third.

---

### A.2 — POS page — reserved zone: **BOTTOM-RIGHT**

> **START / END frame.** A warm Egyptian shop interior at night, closed for the day. A solid warm-oak counter runs diagonally across the upper-left two-thirds of the frame; behind it, softly lit shelves recede into shadow. Cool slate-blue rim light `#3A4A5A` rakes across the counter's edge and mixes with a warm brass-gold key light from an unseen source above. On the counter sits a desktop screen glowing with an elegant right-to-left interface rendered as soft abstract rectangles and a faint curve — absolutely no readable characters. Beside it, a small thermal printer holds a crisp curl of receipt paper, and a tiny brass indicator dot glows steadily. Dust motes hang in the key light. Near-black ink palette. 50mm, shallow depth of field, fine film grain. **COMPOSITION CRITICAL: the entire bottom-right quarter is bare dark floor and shadow — nothing sits there, no light reaches it.**
>
> **MOTION.** An extremely slow push-in of about 20cm toward the counter, with the screen's abstract interface softly re-arranging once — one shape sliding into place, one faint curve redrawing — and the receipt paper curling forward by a centimetre. The brass indicator dot pulses once. The camera eases back out to its exact starting position. First and last frames identical.
>
> **Portrait crop:** shift the crop left so the counter and screen fill the upper half and the dark floor fills the lower half.

---

### A.3 — Store / E-commerce page — reserved zone: **BOTTOM-LEFT**

> **START / END frame.** The interior of a luminous virtual showroom — an impossibly elegant gallery of soft gold light and deep oxblood walls `#5A1F1B`, like a 3D room planner made cinematic. A single sculptural lounge chair floats and slowly rotates on a glowing dais in the upper-right of frame, half-wrapped in a faint holographic gold wireframe that is dissolving into solid photoreal walnut and velvet. Around it, ghosted arcs of soft light and a few floating material swatches orbit slowly like satellites. The room recedes toward a bright gold vanishing point in the centre-right. Near-black ink floor reflecting the gold. Fine film grain, volumetric haze. **COMPOSITION CRITICAL: the entire bottom-left quarter is dark, empty, reflective floor falling into shadow — no swatches, no arcs, no reflections of the chair there.**
>
> **MOTION.** The chair completes exactly one slow full rotation on its dais over the clip's length while the gold wireframe washes over it once and resolves back to solid material. The orbiting swatches complete one slow revolution. The camera holds almost perfectly still with a barely perceptible breathing drift. Because every element completes exactly one cycle, the first and last frames are identical.
>
> **Portrait crop:** shift the crop right to keep the chair and the vanishing point in the upper two-thirds.

---

### A.4 — Projects page — reserved zone: **BOTTOM-CENTRE**

> **START / END frame.** A vast, dark archive hall seen head-on in perfect one-point perspective. Two towering walls of shallow brass-fronted drawers recede toward a distant vanishing point, each drawer front bearing a tiny engraved circular mark that catches the light. A few drawers stand slightly open, and from within each open drawer a soft warm glow spills out and pools on the polished black marble floor. Thin ground mist. A single shaft of brass-gold light falls from far above at the vanishing point. Near-black ink palette, brass-gold highlights, deep oxblood in the recesses. Monumental, quiet, archival. 24mm, deep focus. **COMPOSITION CRITICAL: the entire bottom-centre third of the frame is empty, misted, low-detail marble floor — no drawers, no reflections, no light pools there.**
>
> **MOTION.** A very slow forward dolly of about 40cm down the centre of the hall, during which two more drawers slide open and their glow blooms outward, then close again as the camera eases back to its exact starting position. The mist drifts once across the floor. First and last frames identical.
>
> **Portrait crop:** centre crop — the one-point perspective survives a 9:16 crop intact.

---

### A.5 — Contact page — reserved zone: **CENTRE** (the form sits over it)

> **START / END frame.** An extreme wide, very dark, very calm shot: a single monolithic black-marble wall filling the frame, lit from a raking angle so only its texture and edges register. Set into the wall, far to the upper-left, a small circular brass seal glows faintly like a doorbell or a maker's mark, casting a soft warm pool of light that fades within a metre. Ground mist at the base of the wall. The rest of the frame is near-black stone. Extremely restrained, almost abstract — this is a backdrop, not a scene. Near-black ink `#0A0A0B` with a single brass-gold light source `#C9A86A`. Fine film grain. **COMPOSITION CRITICAL: the entire centre of the frame — the middle 60% of the width and 70% of the height — is flat, unlit, low-detail marble. Nothing may be placed there and no light may reach it. A contact form will sit directly on top of it.**
>
> **MOTION.** The brass seal breathes: its glow swells and fades once over the clip's length, and the pool of light on the wall grows and recedes with it. The mist drifts slowly in one direction. The camera does not move at all. First and last frames identical.
>
> **Portrait crop:** centre crop; move the seal to the upper-third so the form still has clean space below it.

---

# Appendix B — Image generation prompts

Same palette rules as Appendix A. Deliver as **JPEG, 2400px wide, ≤ 500 KB after compression** (use `-quality 80`). Place at the paths given.

### B.1 — `public/bg/counter.jpg` — "The Counter"

> A photograph, shot at night with available light. An extreme close three-quarter view along the surface of a solid warm-oak shop counter in a small Egyptian furniture shop after closing. The wood grain is sharp and tactile in the foreground and falls out of focus toward the back. Sitting on the counter, arranged naturally and not staged: a desktop screen turned partly away from camera, glowing with an abstract right-to-left interface of soft rectangles and one faint curve (absolutely no readable characters); a small thermal receipt printer with a crisp curl of paper feeding out; a worn hardback ledger notebook lying closed with a pen on top; a set of brass keys. A single warm brass-gold key light `#C9A86A` rakes from the upper left; a cool slate-blue rim `#3A4A5A` catches the counter's front edge. Everything beyond the counter dissolves into near-black `#0A0A0B` with two tiny out-of-focus warm highlights. Rich deep shadows, no crushed blacks. Fine film grain, 50mm, f/2.0, shallow depth of field. Colour graded warm brass on near-black ink with deep oxblood in the shadows. Photorealistic, editorial, restrained — no people, no text, no logos, no glass reflections of a photographer.
>
> **Composition note:** leave the upper third of the frame as dark, empty out-of-focus background — the section headline sits there. The four objects must be clearly separated from one another so each can carry an interactive hotspot: screen slightly left of centre, printer right of centre, notebook lower-left, keys lower-right.

### B.2 — `public/bg/grid.jpg` — "The Grid"

> A perfectly overhead flat-lay photograph, shot straight down, of eight objects arranged in a loose grid on dark charcoal felt, lit like a museum specimen tray. The objects, evenly spaced with generous dark space between them: (1) a curled thermal receipt; (2) a small printed barcode label; (3) a retracted brass tape measure; (4) a phone lying face-up showing an abstract vertical video frame of warm gold shapes, no readable text; (5) a printed advertising card showing an abstract product composition in oxblood and gold, no readable text; (6) a folded square of deep oxblood velvet fabric; (7) a single turned walnut chair leg; (8) at the centre, a circular polished brass seal engraved with the Arabic word الحجازي in Diwani calligraphy inside a thin concentric ring with fine geometric guilloche detailing. A single soft brass-gold key light from the upper left casts short, soft shadows to the lower right; the felt reads as near-black `#0A0A0B`. Every object is sharp, evenly focused, and photographed with the calm precision of a Kinfolk still life. Colour graded warm brass and deep oxblood on near-black. Fine grain. No hands, no people, no readable text anywhere except the الحجازي calligraphy on the seal.
>
> **Composition note:** all eight objects must sit fully inside the middle 80% of the frame with clear dark margins on every side, and no two objects may touch or overlap — each needs its own hit area and its own connector line. The seal goes dead centre.

### B.3 — `public/projects/<id>/01.jpg` — project placeholder covers

Generate one per sample project, varying the subject:

> A photograph of a small Egyptian retail interior at night, seen from a low three-quarter angle: warm-oak fixtures, softly lit shelving receding into shadow, one glowing screen turned away from camera showing abstract soft shapes with no readable text, and a brass detail catching the key light. Warm brass-gold key `#C9A86A` against near-black `#0A0A0B`, deep oxblood `#5A1F1B` in the shadows. Photorealistic, editorial, calm, no people, no text, no logos. Shallow depth of field, fine film grain. **Vertical 3:4 orientation** — these images are shown inside tall narrow panels, so the subject must read when cropped to a narrow vertical strip.

---

## What is deliberately NOT in this plan

State these to the owner rather than silently skipping them:

- **No new content for the interiors of `/services/marketing`, `/products/pos`, `/products/ecommerce`.** Those pages get a new video hero (Phase 5) and inherit the new tokens, but their existing sections are left as they are.
- **`public/shots/*` are deleted, not replaced.** Real product screenshots must be captured from the Electron POS app (`D:\code\retailer`) and the live store, and no design in this plan depends on them.
- **No email delivery.** With Mongo removed there is no lead storage and no email service — every conversion goes to WhatsApp. If the owner later wants lead capture, that is a separate piece of work.
- **`src/config/site.ts` contact details are placeholders.** The site will publish a fake phone number and email until the owner replaces them.
