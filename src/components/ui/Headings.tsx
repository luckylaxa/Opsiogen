import { cn, giantClass } from "@/lib/utils";

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

/** Centered giant uppercase heading used by heroes and the big section titles. */
export function GiantHeading({
  label,
  heading,
  text,
  as: Tag = "h2",
  labelStyle = "plain",
  className,
  children,
}: {
  label?: string | null;
  heading: string;
  text?: string | null;
  as?: "h1" | "h2" | "p";
  labelStyle?: "plain" | "pill";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col items-center px-gutter text-center", className)}>
      {label &&
        (labelStyle === "pill" ? (
          <p className="mb-[clamp(24px,calc(2.03vw+16.4px),55px)] rounded-[4px] border border-ink/25 px-[0.6em] py-[0.15em] text-base text-ink">
            {label}
          </p>
        ) : (
          <Label className="mb-[clamp(20px,calc(2.29vw+11.4px),55px)]">{label}</Label>
        ))}
      <Tag className={cn(giantClass(heading), "w-full font-semibold uppercase text-balance [overflow-wrap:anywhere]")}>{heading}</Tag>
      {text && (
        <p className="mt-[clamp(20px,calc(1.64vw+13.8px),45px)] max-w-[34ch] text-lead text-ink text-balance">{text}</p>
      )}
      {children}
    </div>
  );
}
