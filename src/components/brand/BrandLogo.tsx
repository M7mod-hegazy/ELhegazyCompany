import { cn } from "@/lib/cn";

/**
 * شركة الحجازي brand mark — wordmark-led lockup:
 * the الحجازي wordmark in brass, with the ELHEGAZI Latin caption beneath.
 * No container. Scales via `em`, so size it by setting font-size on the
 * element (e.g. className="text-lg").
 */
export function BrandLogo({
  variant = "full",
  className,
}: {
  variant?: "full" | "mark";
  className?: string;
}) {
  if (variant === "mark") {
    return (
      <span
        aria-label="الحجازي"
        className={cn("font-display-ar font-semibold leading-none text-brass", className)}
      >
        الحجازي
      </span>
    );
  }

  return (
    <span
      aria-label="شركة الحجازي · ElHegazi"
      className={cn("inline-flex flex-col items-start gap-0.5 leading-none", className)}
      dir="rtl"
    >
      <span className="font-display-ar text-[1.35em] font-semibold text-brass">
        الحجازي
      </span>
      <span className="font-body-en text-[0.48em] uppercase tracking-[0.42em] text-bone-muted">
        ElHegazi
      </span>
    </span>
  );
}
