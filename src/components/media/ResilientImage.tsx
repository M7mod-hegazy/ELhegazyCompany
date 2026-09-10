"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { useTranslations } from "next-intl";

type ResilientImageProps = ImageProps & {
  fallbackClassName?: string;
};

function sourceKey(src: ImageProps["src"]): string {
  if (typeof src === "string") return src;
  return "src" in src ? src.src : src.default.src;
}

/**
 * A next/image layer with a branded fallback underneath it.
 *
 * The fallback is present from the first paint, so slow, missing, blocked, or
 * corrupt images never expose a broken-image icon or an empty black rectangle.
 */
export function ResilientImage({
  alt,
  className,
  fallbackClassName,
  onLoad,
  onError,
  style,
  src,
  ...props
}: ResilientImageProps) {
  const t = useTranslations("Media");
  const key = sourceKey(src);
  const [status, setStatus] = useState({ key, loaded: false, failed: false });
  const loaded = status.key === key && status.loaded;
  const failed = status.key === key && status.failed;

  return (
    <>
      <div
        className={`absolute inset-0 grid place-items-center overflow-hidden bg-ink-800 transition-opacity duration-300 ${
          loaded && !failed ? "opacity-0" : "opacity-100"
        } ${fallbackClassName ?? className ?? ""}`}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
      >
        <div aria-hidden className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(201,168,106,.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(201,168,106,.12)_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="relative flex max-w-[18rem] flex-col items-center gap-3 px-6 text-center">
          <span className="seal-round grid h-12 w-12 place-items-center border border-brass/35 text-brass">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 5h16v14H4zM4 16l4.5-4.5 3.5 3 2.5-2.5 5.5 5" />
              <circle cx="15.5" cy="8.5" r="1.5" />
            </svg>
          </span>
          {alt && <span className="font-mono text-xs leading-relaxed text-bone-muted">{t("imageUnavailable")}</span>}
        </div>
      </div>

      {!failed && (
        <Image
          {...props}
          src={src}
          alt={alt}
          className={className}
          onLoad={(event) => {
            setStatus({ key, loaded: event.currentTarget.naturalWidth > 0, failed: false });
            onLoad?.(event);
          }}
          onError={(event) => {
            setStatus({ key, loaded: false, failed: true });
            onError?.(event);
          }}
          style={{
            ...style,
            opacity: loaded ? (style?.opacity ?? 1) : 0,
            transition: "opacity 360ms var(--ease-out-soft)",
          }}
        />
      )}
    </>
  );
}
