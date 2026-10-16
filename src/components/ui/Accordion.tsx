import { Plus } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export type AccordionItem = { key: string; title: string; content: React.ReactNode };

/**
 * The design system's editorial accordion: an index, a large title and a
 * plus that turns into a cross, between hairline rules; the open row's rule
 * turns ink. Built on details and summary, so it works without JavaScript.
 * Rows sharing a `name` open one at a time; the first starts open unless
 * `openFirst` is false.
 */
export function Accordion({
  items,
  name,
  numbered = true,
  openFirst = true,
  titleAs: Title = "h3",
  className,
}: {
  items: AccordionItem[];
  name: string;
  numbered?: boolean;
  /** Start with the first row open. */
  openFirst?: boolean;
  titleAs?: "h2" | "h3";
  className?: string;
}) {
  if (!items.length) return null;
  return (
    <div className={cn("border-b border-line", className)}>
      {items.map((item, i) => (
        <details
          key={item.key}
          name={name}
          open={openFirst && i === 0}
          data-reveal
          className="accordion group/acc border-t border-line transition-[border-color] duration-300 open:border-ink"
        >
          <summary
            className={cn(
              "grid cursor-pointer list-none items-center gap-4 py-[clamp(20px,1.6vw,30px)] [&::-webkit-details-marker]:hidden",
              numbered
                ? "grid-cols-[clamp(32px,2.95vw,56px)_minmax(0,1fr)_auto]"
                : "grid-cols-[minmax(0,1fr)_auto]",
            )}
          >
            {numbered && <span className="text-small text-mute tabular-nums">{String(i + 1).padStart(2, "0")}</span>}
            <Title className="text-[length:clamp(20px,calc(0.84vw+16.8px),32px)] leading-[1.2] font-medium tracking-[-0.015em] text-balance">
              {item.title}
            </Title>
            <span
              aria-hidden="true"
              className="grid size-[clamp(38px,2.3vw,44px)] place-items-center rounded-btn border border-line transition-colors duration-300 group-open/acc:border-transparent group-open/acc:bg-ink group-open/acc:text-page"
            >
              <Plus className="size-[18px] transition-transform duration-500 ease-[var(--ease-out-soft)] group-open/acc:rotate-45" />
            </span>
          </summary>
          <div
            className={cn(
              "max-w-[62ch] pb-[clamp(22px,1.6vw,30px)] pr-[clamp(0px,3.2vw,60px)] text-lead text-ink-2 text-pretty",
              numbered && "pl-[calc(clamp(32px,2.95vw,56px)+16px)]",
            )}
          >
            {item.content}
          </div>
        </details>
      ))}
    </div>
  );
}
