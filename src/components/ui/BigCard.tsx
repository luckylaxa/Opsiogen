import Link from "next/link";
import type { Img } from "@/lib/types";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/utils";

type Props = {
  /** Makes the whole card a link. */
  href?: string;
  /** Initials in the round badge, top left. */
  badge: string;
  image?: Img | null;
  /** Number of dots under the image (1–5). */
  dots?: number;
  label?: string | null;
  title: string;
  titleAs?: "h2" | "h3";
  /** The small boxed figure beside the title, e.g. Year 2026. */
  stat?: { label: string; value: string } | null;
  footLeft?: React.ReactNode;
  footRight?: React.ReactNode;
  imageSizes?: string;
  className?: string;
};

/**
 * The reference's big dark card (its directory “creator” card): a badge, an
 * image set right of centre with dots below it, then a label, a large title
 * with a boxed figure and a footer line. Measured at 873 × 693 on a 1903px
 * screen; two per row from desktop up, one per row below. The list holding
 * the cards must be an `@container`: from desktop up a card is at least
 * 693/873 of its width tall, and grows if its content needs more.
 */
export function BigCard({
  href,
  badge,
  image,
  dots = 1,
  label,
  title,
  titleAs: Title = "h3",
  stat,
  footLeft,
  footRight,
  imageSizes = "(min-width: 1024px) 18vw, 56vw",
  className,
}: Props) {
  const count = Math.min(Math.max(dots, 1), 5);
  const body = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span
          aria-hidden="true"
          className="grid size-[clamp(40px,3.42vw,65px)] shrink-0 place-items-center rounded-full bg-black/45 text-[length:clamp(13px,1.05vw,20px)] font-semibold"
        >
          {badge}
        </span>
        {image && (
          <div className="w-[56%] lg:mr-[14.1%] lg:w-[45.8%]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[clamp(4px,0.42vw,8px)] bg-night">
              <Media
                image={image}
                sizes={imageSizes}
                className="transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
              />
            </div>
          </div>
        )}
      </div>
      <div aria-hidden="true" className="mt-[clamp(14px,2.1vw,40px)] flex justify-end gap-[clamp(8px,0.79vw,15px)]">
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className={cn("size-[clamp(6px,0.53vw,10px)] rounded-full", i === 0 ? "bg-white" : "bg-white/20")} />
        ))}
      </div>

      <div className="mt-auto pt-4">
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
    <Link href={href} data-reveal className={cls}>
      {body}
    </Link>
  ) : (
    <div data-reveal className={cls}>
      {body}
    </div>
  );
}
