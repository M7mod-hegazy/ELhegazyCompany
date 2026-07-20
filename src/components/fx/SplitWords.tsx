"use client";

import { m } from "framer-motion";

/** Kinetic heading: words assemble in one-by-one on scroll. (Word-level, not
 *  letter-level, because Arabic is cursive and per-letter splitting breaks it.) */
export function SplitWords({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <span className={className} style={{ display: "inline-block" }}>
      {words.map((w, i) => (
        <m.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: "0.55em" }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </m.span>
      ))}
    </span>
  );
}
