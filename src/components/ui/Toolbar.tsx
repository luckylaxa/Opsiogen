import Link from "next/link";
import { cn, isExternal } from "@/lib/utils";
import { ArrowUpRight } from "./Icons";

type Item = { label: string; href: string };

/**
 * The dark pill bar that sits under big titles in the reference: a mark tile,
 * a row of tabs and one highlighted action. Scrolls sideways on small screens.
 */
export function Toolbar({
  mark,
  items,
  action,
  label,
  className,
}: {
  mark: string;
  items: Item[];
  action?: Item | null;
  label: string;
  className?: string;
}) {
  if (!items.length && !action) return null;
  // On phones the bar would overflow; drop the action there (it repeats a button lower down).
  const length = items.reduce((n, i) => n + i.label.length, 0) + (action?.label.length ?? 0);
  const compact = length > 32 && Boolean(action) && !isExternal(action!.href);
  return (
    <nav aria-label={label} className={cn("on-dark flex max-w-full justify-center", className)}>
      <div className="flex max-w-full items-center gap-[3px] overflow-x-auto rounded-[10px] bg-coal p-[4px] text-white [scrollbar-width:none]">
        <span
          aria-hidden="true"
          className="grid size-[clamp(38px,calc(0.5vw+36px),46px)] shrink-0 place-items-center rounded-[7px] bg-black/45 text-[length:clamp(15px,calc(0.2vw+14px),18px)] font-semibold tracking-[-0.03em]"
        >
          {mark}
        </span>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="grid h-[clamp(38px,calc(0.5vw+36px),46px)] shrink-0 place-items-center rounded-[7px] px-[clamp(12px,calc(0.4vw+10.5px),18px)] text-small whitespace-nowrap text-white/75 transition-colors duration-200 hover:bg-white/10 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
        {action && <ToolbarAction {...action} className={compact ? "hidden sm:inline-flex" : undefined} />}
      </div>
    </nav>
  );
}

function ToolbarAction({ label, href, className }: Item & { className?: string }) {
  const cls = cn(
    "ml-[3px] inline-flex h-[clamp(38px,calc(0.5vw+36px),46px)] shrink-0 items-center gap-1.5 rounded-[7px] bg-page px-[clamp(14px,calc(0.5vw+12px),22px)] text-small font-medium whitespace-nowrap text-ink transition-colors duration-200 hover:bg-white",
    className,
  );
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {label}
        <ArrowUpRight className="size-[1.15em]" />
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {label}
    </Link>
  );
}
