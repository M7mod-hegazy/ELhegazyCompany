import { cn } from "@/lib/cn";

export function SectionHeading({
  kicker,
  title,
  align = "start",
  className,
}: {
  kicker: string;
  title: string;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" ? "text-center" : "text-start", className)}>
      <p className="text-xs uppercase tracking-[0.35em] text-brass">{kicker}</p>
      <h2 className="font-display mt-4 text-4xl font-semibold text-bone sm:text-5xl">
        {title}
      </h2>
    </div>
  );
}
