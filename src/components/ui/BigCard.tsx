import Link from "next/link";
import type { Img } from "@/lib/types";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/utils";

type Props = {
  /** Makes the whole card a link. */
  href?: string;
  /** Initials in the round badge, top left. */
  badge: string;
  /** Fills the whole card, under the badge and the text. */
  image?: Img | null;
  label?: string | null;
  title: string;
  titleAs?: "h2" | "h3";
  /** The small boxed figure beside the title, e.g. Year 2026. */
  stat?: { label: string; value: string } | null;
  footLeft?: React.ReactNode;
  footRight?: React.ReactNode;
  imageSizes?: string;
  /** Cursor over the card: the View disc for work, the ring for everything else. */
  cursor?: "view" | "link";
  className?: string;
};

/**
 * The big dark card: the image fills the whole card, with a badge top left
 * and, over a shade at the bottom, a label, a large title with a boxed
 * figure and a footer line. Measured at 873 × 693 on a 1903px screen; two
 * per row from desktop up, one per row below. The list holding the cards
 * must be an `@container`: from desktop up a card is at least 693/873 of its
 * width tall, and grows if its content needs more.
 */
export function BigCard({
  href,
  badge,
  image,
  label,
  title,
  titleAs: Title = "h3",
  stat,
  footLeft,
  footRight,
  imageSizes = "(min-width: 1024px) 50vw, 100vw",
  cursor = "link",
  className,
}: Props) {
  const body = (
    <>
      {image && (
        <>
          <Media
            image={image}
            sizes={imageSizes}
            className="transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
          />
          {/* Shade so the badge and the text stay readable on any image. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.3)_0%,rgb(0_0_0/0)_22%,rgb(0_0_0/0)_36%,rgb(0_0_0/0.6)_62%,rgb(0_0_0/0.9)_100%)]"
          />
        </>
      )}
      <span
        aria-hidden="true"
        className="relative grid size-[clamp(40px,3.42vw,65px)] shrink-0 place-items-center rounded-full bg-black/45 text-[length:clamp(13px,1.05vw,20px)] font-semibold backdrop-blur-sm"
      >
        {badge}
      </span>

      <div className="relative mt-auto pt-4">
        {label && <p className="text-base text-white/85">{label}</p>}
        <div className="mt-[clamp(8px,1.2vw,22px)] flex items-end justify-between gap-6">
          <Title className="min-w-0 text-[length:clamp(30px,3.15vw,60px)] leading-none font-semibold tracking-[-0.02em] text-balance">
            {title}
          </Title>
          {stat && (
            <p className="flex min-w-[clamp(58px,3.94vw,75px)] shrink-0 flex-col items-center rounded-[8px] border border-white/30 px-3 py-[clamp(6px,0.5vw,10px)] text-center">
              <span className="text-[length:clamp(12px,0.79vw,15px)] text-white/85">{stat.label}</span>
              <span className="text-[length:clamp(20px,1.58vw,30px)] leading-tight font-semibold tabular-nums">{stat.value}</span>
            </p>
          )}
        </div>
        {(footLeft || footRight) && (
          <div className="mt-[clamp(24px,3.05vw,58px)] flex items-end justify-between gap-6 text-base">
            <div className="min-w-0 text-white/85">{footLeft}</div>
            <div className="shrink-0 text-right">{footRight}</div>
          </div>
        )}
      </div>
    </>
  );

  const cls = cn(
    "on-dark group relative flex h-full min-h-[460px] flex-col overflow-hidden rounded-card bg-coal p-[clamp(24px,3.05vw,58px)] text-white sm:min-h-[540px] lg:min-h-[calc((100cqw-var(--spacing-gap))*0.397)]",
    className,
  );
  return href ? (
    <Link href={href} data-reveal data-cursor={cursor} className={cls}>
      {body}
    </Link>
  ) : (
    <div data-reveal className={cls}>
      {body}
    </div>
  );
}
