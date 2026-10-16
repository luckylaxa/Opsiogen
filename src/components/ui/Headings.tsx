import { cn, giantSize } from "@/lib/utils";

/** Small label above a heading, e.g. “Latest”. */
export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-base text-ink", className)}>{children}</p>;
}

/** Left-aligned section heading: label + two-line medium heading. */
export function SectionHeading({
  label,
  heading,
  text,
  as: Tag = "h2",
  className,
}: {
  label?: string | null;
  heading?: string | null;
  text?: string | null;
  as?: "h1" | "h2";
  className?: string;
}) {
  if (!label && !heading && !text) return null;
  return (
    <div className={cn("px-gutter", className)}>
      {label && <Label className="mb-[clamp(16px,calc(1.24vw+11.4px),35px)]">{label}</Label>}
      {heading && <Tag className="max-w-[13.5ch] text-h2 font-medium text-balance">{heading}</Tag>}
      {text && <p className="mt-5 max-w-[46ch] text-lead text-ink-2">{text}</p>}
    </div>
  );
}

/**
 * Index range of the words to show in the brand gradient: the given accent
 * word or phrase (matched ignoring case and punctuation, last occurrence),
 * or the last word when there is none or it isn't in the text.
 */
export function accentRange(words: string[], accent?: string | null): [number, number] {
  const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  const target = (accent ?? "").trim().split(/\s+/).map(norm).filter(Boolean);
  if (target.length) {
    for (let i = words.length - target.length; i >= 0; i--) {
      if (target.every((t, j) => norm(words[i + j]) === t)) return [i, i + target.length - 1];
    }
  }
  return [words.length - 1, words.length - 1];
}

/**
 * Display text with one accent word (or short phrase) in the brand gradient,
 * as the design system sets its headlines: “We remove the DRAG.”.
 */
export function AccentText({ text, accent }: { text: string; accent?: string | null }) {
  const words = text.trim().split(/\s+/);
  const [start, end] = accentRange(words, accent);
  const before = words.slice(0, start).join(" ");
  const after = words.slice(end + 1).join(" ");
  return (
    <>
      {before && `${before} `}
      <span className="text-gradient">{words.slice(start, end + 1).join(" ")}</span>
      {after && ` ${after}`}
    </>
  );
}

/**
 * The design system's line-mask reveal: the text rises into view from behind
 * a mask as it scrolls in (see Reveal.tsx and globals.css).
 */
export function MaskReveal({ children }: { children: React.ReactNode }) {
  return (
    <span data-reveal-mask className="reveal-mask">
      <span>{children}</span>
    </span>
  );
}

/** Centered giant uppercase heading used by heroes and the big section titles. */
export function GiantHeading({
  label,
  heading,
  accent,
  text,
  as: Tag = "h2",
  labelStyle = "plain",
  className,
  children,
}: {
  label?: string | null;
  heading: string;
  /** Word or short phrase shown in the brand gradient; defaults to the last word. */
  accent?: string | null;
  text?: string | null;
  as?: "h1" | "h2" | "p";
  labelStyle?: "plain" | "pill";
  className?: string;
  children?: React.ReactNode;
}) {
  const title = (
    <MaskReveal>
      <AccentText text={heading} accent={accent} />
    </MaskReveal>
  );
  const size = giantSize(heading);
  return (
    <div className={cn("@container flex flex-col items-center px-gutter text-center", className)}>
      {label &&
        (labelStyle === "pill" ? (
          <p className="mb-[clamp(24px,calc(2.03vw+16.4px),55px)] rounded-[4px] border border-ink/25 px-[0.6em] py-[0.15em] text-base text-ink">
            {label}
          </p>
        ) : (
          <Label className="mb-[clamp(20px,calc(2.29vw+11.4px),55px)]">{label}</Label>
        ))}
      {/* Whole words only: words wrap between each other, never inside (see giantSize). */}
      <Tag className={cn(size.className, "w-full font-bold uppercase text-balance")} style={size.style}>
        {title}
      </Tag>
      {text && (
        <p className="mt-[clamp(20px,calc(1.64vw+13.8px),45px)] max-w-[34ch] text-lead text-ink text-balance">{text}</p>
      )}
      {children}
    </div>
  );
}
