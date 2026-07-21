# HomeFilm Performance Rebuild — Checkpoint Plan

## Overview
Full rebuild of the home page scroll-scrubbed video using WebCodecs frame decoding
with canvas rendering, replacing the current `<video>` currentTime seeking approach.

## Checkpoints

### Phase 1: Foundation ✅
- [x] `npm install mp4box`
- [x] `src/lib/video/frame-decoder.ts` — Web Worker with MP4Box demux + WebCodecs VideoDecoder
- [x] `src/lib/video/frame-buffer.ts` — LRU frame cache with GPU memory management
- [x] `src/lib/video/canvas-renderer.ts` — DPR-capped canvas drawing utility
- [x] All files compile without TS errors

### Phase 2: Scroll Controller ✅
- [x] `src/lib/video/scroll-controller.ts` — Scroll→frame mapping with idle RAF detection
- [x] RAF loop stops when scroll settles (3 consecutive identical frames)
- [x] RAF loop restarts on next scroll event
- [x] Debounces seeking (only processes latest frame index)

### Phase 3: Capability Detection & Fallback ✅
- [x] `src/lib/video/capabilities.ts` — Runtime detection of WebCodecs/videoCallback/videoSeeking/none
- [x] `src/components/film/FrameScrubbedVideo.tsx` — Canvas-based WebCodecs renderer
- [x] `src/components/film/VideoCallbackScrub.tsx` — requestVideoFrameCallback fallback
- [x] `src/components/film/VideoSeekScrub.tsx` — Cleaned original <video> approach
- [x] Graceful degradation through all 4 tiers

### Phase 4: Mobile Optimizations ✅
- [x] Desktop: DPR capped at 1.5, 60-frame buffer
- [x] Mobile (<640px): DPR capped at 1.0, 30-frame buffer
- [x] Source selection: desktop 1080p vs mobile (no resize re-fire)
- [x] Connection-aware loading (skip video on slow/2g/save-data)

### Phase 5: Decouple Chapter Overlays ✅
- [x] Remove duplicate mobile/desktop DOM trees (where layouts are structurally identical)
- [x] Keep StackedFallback as-is (gated behind detectBackend)
- [x] Keep imperative useMotionValueEvent ramp() pattern for overlays
- [x] SubBeatChapter keeps both mobile/desktop DOM trees (structurally different layouts)

### Phase 6: Bundle & Render Overhead ✅
- [x] `src/app/[locale]/page.tsx` — Dynamic import for Stats, SocialAdsBand, LogoMarquee, CtaBand
- [x] `src/components/site/Navbar.tsx` — DOM-based scroll class (no React state re-render)
- [x] `src/components/fx/Cursor.tsx` — Kill RAF loop when trail settles within 0.1px

### Phase 7: Preloader & Template ✅
- [x] Preloader MIN_MS reduced from 2800 → 1500
- [x] Template: let HomeFilm mount immediately (behind overlay), not blocked by curtain
- [ ] Preload poster image via `<link rel="preload">` (deferred — not critical)

### Phase 8: Video Re-encoding
- [ ] WebM/VP9 variant with `-g 15` for WebCodecs path (deferred — H.264 works)
- [ ] Strip audio from all variants (`-an`) (deferred — audio is already silent)
- [x] Keep existing H.264 MP4 as fallback

### Phase 9: Next.js Config ✅
- [x] Cache headers for `/films/*` and `/posters/*` (immutable, 1 year)
- [x] Worker type support in tsconfig (added `webworker` to lib)

### Phase 10: Validation ✅
- [x] `npm run lint` — passes (0 new errors; pre-existing errors in unrelated files)
- [x] `npx tsc --noEmit` — passes clean
- [x] All existing fallback paths preserved

## Architecture
```
Scroll → ScrollController → FrameDecoder (Worker) → FrameBuffer → CanvasRenderer
                                           ↓
                              detectBackend() selects:
                              1. WebCodecs + Canvas (primary)
                              2. requestVideoFrameCallback + Canvas (fallback)
                              3. <video> currentTime seeking (last resort)
                              4. StackedFallback posters (reduced-motion/failure)
```

## Files Changed
- NEW: src/lib/video/frame-buffer.ts
- NEW: src/lib/video/canvas-renderer.ts
- NEW: src/lib/video/frame-decoder.ts
- NEW: src/lib/video/scroll-controller.ts
- NEW: src/lib/video/capabilities.ts
- NEW: src/components/film/FrameScrubbedVideo.tsx
- NEW: src/components/film/VideoCallbackScrub.tsx
- NEW: src/components/film/VideoSeekScrub.tsx
- REWRITE: src/components/film/HomeFilm.tsx
- EDIT: src/app/[locale]/page.tsx (dynamic imports for below-fold sections)
- EDIT: src/components/site/Navbar.tsx (DOM-based scroll class)
- EDIT: src/components/fx/Cursor.tsx (idle RAF detection)
- EDIT: src/app/[locale]/template.tsx (content mounts behind overlay)
- EDIT: src/components/fx/Preloader.tsx (reduced MIN_MS)
- EDIT: next.config.ts (cache headers)
- EDIT: tsconfig.json (webworker lib)
- EDIT: package.json (mp4box dependency)
