import Image from "next/image";
import mark from "@/assets/opsiogen-mark.png";
import { cn } from "@/lib/utils";

/** The Opsiogen logo mark (gradient ring). Decorative wherever the name is also present. */
export function Mark({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src={mark}
      alt=""
      aria-hidden="true"
      sizes="96px"
      priority={priority}
      className={cn("size-[1.2em] shrink-0 select-none", className)}
      draggable={false}
    />
  );
}
