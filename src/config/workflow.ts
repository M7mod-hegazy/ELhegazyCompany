/**
 * Project categories — also exported from src/config/projects.ts (Phase 4).
 * This file is kept only as a re-export shim until all imports are migrated.
 */
export const PROJECT_CATEGORIES = [
  "marketing",
  "brand",
  "video",
  "furniture",
  "pos",
  "ecommerce",
] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];
