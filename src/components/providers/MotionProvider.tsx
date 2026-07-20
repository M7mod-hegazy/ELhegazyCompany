"use client";

import { LazyMotion, domAnimation } from "framer-motion";

/**
 * Loads framer-motion's domAnimation features (~15kb) instead of the full
 * library (~34kb). All `motion.*` JSX must be replaced with `m.*` for this
 * to take effect — `motion.*` bypasses LazyMotion and loads everything.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
