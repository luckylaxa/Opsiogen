import { Mark } from "@/components/site/Mark";
import { cn } from "@/lib/utils";

/**
 * The logo mark set over the end of a giant title, the way the reference
 * places its sticker. Turns slowly; decorative. Sized in em, so it scales
 * with the title it sits in.
 */
export function Sticker({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative -ml-[0.06em] inline-block size-[0.6em] translate-y-[0.1em] align-baseline", className)}
    >
      <Mark className="spin-slow size-full drop-shadow-[0_0.05em_0.12em_rgb(0_0_0/0.25)]" />
    </span>
  );
}
