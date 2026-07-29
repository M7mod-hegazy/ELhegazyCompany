/**
 * The home-page brand film config.
 *
 * The film is now split into two independent scroll-scrubbed sections:
 *   - IntroFilm at the top (intro chapter, seeks 0 → 0.25 of the video)
 *   - OutroFilm at the bottom (outro chapter, seeks 0.75 → 1.0)
 *
 * The three middle chapters (marketing, pos, ecommerce) have been replaced
 * by HTML/CSS product sections in BelowFold.
 */

export type FilmZone = "center" | "bottom-left" | "bottom-right";

export type FilmChapterId = "intro" | "outro";

export type FilmChapterDef = {
  id: FilmChapterId;
  zone: FilmZone;
  accent: string;
  /** scroll height in vh — controls pacing */
  vh: number;
};

/** Shared video source (concatenated intro + outro) */
export const filmSrc = "/films/home-film-1080p.mp4";
export const filmSrcMobile = "/films/home-film-mobile.mp4";
export const filmPoster = "/films/home-film-poster.jpg";
export const filmPosterDir = "/posters/home";

/**
 * Intro chapter: the first ~25% of the concatenated video.
 * Seeks from progress 0 → 0.25 over 160vh of scroll.
 */
export const introChapter: FilmChapterDef = {
  id: "intro",
  zone: "center",
  accent: "#C9A86A",
  vh: 160,
};

/**
 * Outro chapter: the last ~25% of the concatenated video.
 * Seeks from progress 0.75 → 1.0 over 160vh of scroll.
 */
export const outroChapter: FilmChapterDef = {
  id: "outro",
  zone: "bottom-right",
  accent: "#E8D6A8",
  vh: 160,
};

/** Intro film config (used by IntroFilm component) */
export const introFilm = {
  src: filmSrc,
  srcMobile: filmSrcMobile,
  poster: filmPoster,
  posterDir: filmPosterDir,
  chapter: introChapter,
  /** Seek range: 0 = start of video, 0.25 = end of intro */
  seekStart: 0,
  seekEnd: 0.25,
} as const;

/** Outro film config (used by OutroFilm component) */
export const outroFilm = {
  src: filmSrc,
  srcMobile: filmSrcMobile,
  poster: filmPoster,
  posterDir: filmPosterDir,
  chapter: outroChapter,
  /** Seek range: 0.75 = start of outro, 1.0 = end of video */
  seekStart: 0.75,
  seekEnd: 1.0,
} as const;
