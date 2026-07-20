"use client";

import React from "react";

/** Falls back to a static element if anything in the 3D subtree throws
 *  (e.g. WebGL context loss, postprocessing init failure). */
export class CanvasErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Swallow — the fallback is the recovery.
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
