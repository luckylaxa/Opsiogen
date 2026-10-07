import { cn } from "@/lib/utils";

/**
 * Round yellow sticker that overlaps the end of a giant title, as the
 * reference does on its section titles. Carries the Opsiogen mark. Decorative.
 * Sized in em, so it scales with the title it sits in.
 */
export function Sticker({ mark, className }: { mark: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative -ml-[0.14em] inline-grid size-[0.4em] translate-y-[0.1em] rotate-[-14deg] place-items-center rounded-full bg-sticker align-baseline shadow-[0_0.03em_0.1em_rgb(0_0_0/0.18)] transition-transform duration-500 ease-[var(--ease-out-soft)] hover:rotate-[16deg]",
        className,
      )}
    >
      <span className="text-[0.17em] leading-none font-semibold tracking-[-0.04em] text-ink normal-case">{mark}</span>
    </span>
  );
}
