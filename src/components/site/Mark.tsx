import Image from "next/image";
import mark from "@/assets/opsiogen-mark.png";
import { cn } from "@/lib/utils";

/**
 * The Opsiogen logo mark (gradient ring). Decorative; set its size with `className`.
 * `eager` loads it at once and first, for when it is the first thing on screen (the preloader).
 */
export function Mark({ className, eager }: { className?: string; eager?: boolean }) {
  return (
    <Image
      src={mark}
      alt=""
      aria-hidden="true"
      sizes="96px"
      loading={eager ? "eager" : undefined}
      fetchPriority={eager ? "high" : undefined}
      className={cn("shrink-0 select-none", className)}
      draggable={false}
    />
  );
}
