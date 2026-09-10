type ShotEntry = { done: boolean };

/**
 * Registry of "critical" screenshots the page must show before the brand
 * preloader fades. A ShotFrame with `priority` registers its src here; the
 * preloader polls `shotsLoading()` and only releases the intro once every
 * registered shot has finished loading (or failed — a 404 must never hold the
 * page hostage).
 *
 * The fetch is started immediately via `new Image()`. The browser coalesces
 * this with the actual `<img>` in the DOM (identical URL), so it is one network
 * request — but it starts earlier, at high priority, which is exactly what was
 * missing before.
 */
const registry = new Map<string, ShotEntry>();

export function registerShot(url: string): void {
  if (registry.has(url)) return;
  const entry: ShotEntry = { done: false };
  registry.set(url, entry);

  const img = new Image();
  img.fetchPriority = "high";
  img.onload = () => {
    entry.done = true;
  };
  img.onerror = () => {
    entry.done = true;
  };
  img.src = url;
}

export function shotsLoading(): boolean {
  for (const entry of registry.values()) {
    if (!entry.done) return true;
  }
  return false;
}
