import Image from "next/image";
import mark from "@/assets/opsiogen-mark.png";
import { cn } from "@/lib/utils";

/** The Opsiogen logo mark (gradient ring). Decorative; set its size with `className`. */
export function Mark({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src={mark}
      alt=""
      aria-hidden="true"
      sizes="96px"
      priority={priority}
      className={cn("shrink-0 select-none", className)}
      draggable={false}
    />
  );
}
