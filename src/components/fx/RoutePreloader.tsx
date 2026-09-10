"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { PreloaderPanel } from "@/components/fx/PreloaderPanel";

const MIN_VISIBLE_MS = 520;
const MEDIA_WAIT_CAP_MS = 3600;
const NAVIGATION_CAP_MS = 8000;
const FADE_MS = 520;

const PRIMARY_ROUTES = [
  "/services/marketing",
  "/products/pos",
  "/products/ecommerce",
  "/projects",
  "/contact",
] as const;

const ROUTE_POSTERS: Record<string, string> = {
  "/": "/films/hero-intro.jpg",
  "/services/marketing": "/films/page-marketing-v4.jpg",
  "/products/pos": "/films/page-pos-v4.jpg",
  "/products/ecommerce": "/films/page-ecommerce-v4.jpg",
  "/projects": "/films/page-projects-v4.jpg",
  "/contact": "/films/page-contact-v4.jpg",
};

function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

/** Wait only for media that can affect the destination's first viewport. */
function waitForCriticalImages(timeoutMs: number): Promise<void> {
  const images = Array.from(document.images).filter((image) => {
    if (image.complete) return false;
    const rect = image.getBoundingClientRect();
    return rect.bottom >= 0 && rect.top <= window.innerHeight * 1.25;
  });

  if (images.length === 0) return Promise.resolve();

  const settled = Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        }),
    ),
  ).then(() => undefined);

  return Promise.race([
    settled,
    new Promise<void>((resolve) => window.setTimeout(resolve, timeoutMs)),
  ]);
}

function routeFromUrl(url: URL): string {
  return url.pathname.replace(/^\/(ar|en)(?=\/|$)/, "") || "/";
}

function canPrefetch(): boolean {
  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;
  return !connection?.saveData && !["slow-2g", "2g"].includes(connection?.effectiveType ?? "");
}

function prefetchPoster(route: string) {
  const href = ROUTE_POSTERS[route];
  if (!href || document.head.querySelector(`link[data-route-poster="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.as = "image";
  link.href = href;
  link.dataset.routePoster = href;
  document.head.appendChild(link);
}

/**
 * Full-screen brand preloader for client-side route changes.
 *
 * On click it covers the viewport with the same brand fill as the first-visit
 * intro (Preloader) and tracks real progress — the count creeps while the
 * destination streams in, then waits for above-the-fold images before the
 * panel dissolves. Prefetch warming is unchanged: primary routes warm during
 * idle time, hover/focus/touch warms the exact route and its hero poster.
 */
export function RoutePreloader() {
  const t = useTranslations("Media");
  const pathname = usePathname();
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const creepRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousPath = useRef(pathname);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!canPrefetch()) return;

    const prefetchRoute = (route: string) => {
      router.prefetch(route);
      prefetchPoster(route);
    };

    const onIntent = (event: Event) => {
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      const href = anchor?.getAttribute("href");
      if (!href) return;
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      prefetchRoute(routeFromUrl(url));
    };

    document.addEventListener("pointerover", onIntent, { passive: true });
    document.addEventListener("focusin", onIntent);

    const warm = () => PRIMARY_ROUTES.forEach(prefetchRoute);
    const win = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const idleId = win.requestIdleCallback
      ? win.requestIdleCallback(warm, { timeout: 2200 })
      : window.setTimeout(warm, 1400);

    return () => {
      document.removeEventListener("pointerover", onIntent);
      document.removeEventListener("focusin", onIntent);
      if (typeof win.cancelIdleCallback === "function") win.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
    };
  }, [router]);

  useEffect(() => {
    // Capture phase is deliberate: Next's <Link> prevents the click default in
    // its own (bubble) handler, so a bubble listener here would always see
    // `defaultPrevented === true` and never trigger. Capture runs before any
    // target handler, so we still get the event before Link takes over.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;

      if (hideRef.current) clearTimeout(hideRef.current);
      if (creepRef.current) clearInterval(creepRef.current);
      if (safetyRef.current) clearTimeout(safetyRef.current);

      startedAt.current = performance.now();
      document.body.style.overflow = "hidden";
      setActive(true);
      setProgress(14);

      let value = 14;
      creepRef.current = setInterval(() => {
        value += (92 - value) * 0.14;
        setProgress(value);
      }, 160);

      safetyRef.current = setTimeout(() => {
        if (creepRef.current) clearInterval(creepRef.current);
        setProgress(100);
        document.body.style.overflow = "";
        hideRef.current = setTimeout(() => setActive(false), 240);
      }, NAVIGATION_CAP_MS);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    if (creepRef.current) clearInterval(creepRef.current);
    if (safetyRef.current) clearTimeout(safetyRef.current);

    const start = startedAt.current ?? performance.now();
    let cancelled = false;

    (async () => {
      await waitForPaint();
      await waitForCriticalImages(MEDIA_WAIT_CAP_MS);
      const remaining = Math.max(0, MIN_VISIBLE_MS - (performance.now() - start));
      if (remaining) await new Promise((resolve) => window.setTimeout(resolve, remaining));
      if (cancelled) return;
      setProgress(100);
      document.body.style.overflow = "";
      hideRef.current = setTimeout(() => {
        setActive(false);
        setProgress(0);
        startedAt.current = null;
      }, 260);
    })();

    return () => {
      cancelled = true;
      if (hideRef.current) clearTimeout(hideRef.current);
    };
  }, [pathname]);

  return (
    <AnimatePresence>
      {active && (
        <m.div
          key="route-preloader"
          role="status"
          aria-label={t("loadingPage")}
          className="fixed inset-0 z-[130] flex flex-col items-center justify-center bg-ink-900"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: FADE_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
        >
          <PreloaderPanel pct={progress} />
        </m.div>
      )}
    </AnimatePresence>
  );
}
