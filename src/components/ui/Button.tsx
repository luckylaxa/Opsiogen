import Link from "next/link";
import { cn, isExternal } from "@/lib/utils";

type Variant = "dark" | "outline" | "outline-light" | "light";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-btn)] border font-medium transition-[background-color,color,border-color] duration-300 ease-out";

const variants: Record<Variant, string> = {
  dark: "border-ink bg-ink text-white hover:bg-[#3a3a3a] hover:border-[#3a3a3a]",
  outline: "border-ink bg-transparent text-ink hover:bg-ink hover:text-white",
  "outline-light": "border-white/90 bg-transparent text-white hover:bg-page hover:text-ink hover:border-page",
  light: "border-band bg-band text-ink hover:bg-white hover:border-white",
};

const sizes: Record<Size, string> = {
  md: "h-[clamp(42px,calc(0.65vw+39.5px),52px)] px-[clamp(16px,calc(0.52vw+14px),24px)] text-base",
  lg: "h-[clamp(52px,calc(2.23vw+43.6px),86px)] px-[clamp(22px,calc(1.5vw+16.4px),45px)] text-[length:clamp(17px,calc(0.59vw+14.8px),26px)] font-normal",
};

export function buttonClass(variant: Variant = "dark", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
};

export function ButtonLink({ href, children, variant = "dark", size = "md", className }: Props) {
  const cls = buttonClass(variant, size, className);
  if (isExternal(href)) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
