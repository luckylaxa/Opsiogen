import Link from "next/link";
import { ArrowRight } from "./Icons";
import { cn } from "@/lib/utils";

/** Centered “→ View all work” link from the reference. */
export function ArrowLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex justify-center px-gutter", className)}>
      <Link href={href} className="group inline-flex items-center gap-[0.6em] text-base font-medium">
        <ArrowRight className="size-[1.25em] transition-transform duration-300 ease-out group-hover:translate-x-1" />
        <span className="link-underline">{children}</span>
      </Link>
    </div>
  );
}
