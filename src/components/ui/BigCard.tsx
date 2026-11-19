import Link from "next/link";
import type { Img } from "@/lib/types";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/utils";

type Props = {
  /** Makes the whole card a link. */
  href?: string;
  /** Replace the current history entry instead of adding one. */
  replace?: boolean;
  /** Scroll to the top of the new page (off for links that open the project pop-up). */
  scroll?: boolean;
  /** Initials in the round badge, top left. */
  badge: string;
  /**
   * A one-colour logo shown instead of the initials, in a pill (work cards: the client's logo).
   * `src` is the SVG, `ratio` its width to height, `size` an optical size adjustment (1 by default).
   */
  logo?: { src: string; ratio: number; size?: number } | null;
  /** Fills the whole card, under the badge and the text. */
  image?: Img | null;
  /** A version of the image shaped for phones, shown below 640px. */
  imagePhone?: Omit<Img, "alt" | "hotspot"> | null;
  label?: string | null;
  title: string;
  titleAs?: "h2" | "h3" | "h4";
  /** The small boxed figure beside the title, e.g. Year 2026. */
  stat?: { label: string; value: string } | null;
  footLeft?: React.ReactNode;
  footRight?: React.ReactNode;
  imageSizes?: string;
  /** The image is the page's main one: it loads at once, ahead of the rest. */
  priority?: boolean;
  /**
   * Where the text sits. "bottom" (work): badge on top, label, big title and a
   * footer line over a shade at the bottom. "top" (services): title and one
   * line at the top left, straight on the image, whose subject sits low.
   */
  layout?: "bottom" | "top";
  /**
   * Top layout, service page tiles: one picture with the text straight on it (no shade), and a
   * text sized to the screen width on phones (the 10:9 phone card keeps the device, anchored right).
   */
  plain?: boolean;
  /** Cursor over the card: the View disc for work, the ring for everything else. */
  cursor?: "view" | "link";
  className?: string;
};

/**
 * The big dark card: the image fills the whole card, with a badge top left
 * and, over a shade at the bottom, one tight stack: a small label, a large
 * title (with an optional boxed figure) and a footer line. Measured at 873 × 693 on a 1903px screen; two
 * per row from desktop up, one per row below. The list holding the cards
 * must be an `@container`: from desktop up a card is at least 693/873 of its
 * width tall, and grows if its content needs more.
 */
export function BigCard({
  href,
  replace = false,
  scroll = true,
  badge,
  logo,
  image,
  imagePhone,
  label,
  title,
  titleAs: Title = "h3",
  stat,
  footLeft,
  footRight,
  imageSizes = "(min-width: 1024px) 50vw, 100vw",
  priority,
  cursor = "link",
  layout = "bottom",
  plain = false,
  className,
}: Props) {
  const top = (
    <>
      {image && (
        <Media
          image={image}
          phone={imagePhone}
          sizes={imageSizes}
          priority={priority}
          className="transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
        />
      )}
      {/* A light shade at the top only, under the text. Service page tiles (`plain`) have none. */}
      {image && !plain && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.46)_0%,rgb(0_0_0/0.2)_24%,rgb(0_0_0/0)_46%)]"
        />
      )}
      {/* Plain tiles on phones: text sized to the screen width, so it always ends above the device. */}
      <div className={cn("relative", plain ? "max-sm:max-w-none sm:max-w-[26ch]" : "max-w-[26ch]")}>
        <Title
          className={cn(
            "text-[length:clamp(24px,2.1vw,40px)] leading-[1.1] font-medium tracking-[-0.015em] text-balance",
            plain && "max-sm:text-[5.8vw]",
          )}
        >
          {/* Keep hyphenated words whole (no "Developer-" / "ready" split). */}
          {title.split(/(\S+-\S+)/).map((part, i) => (i % 2 ? <span key={i} className="whitespace-nowrap">{part}</span> : part))}
        </Title>
        {footLeft && (
          <div
            className={cn(
              "mt-[clamp(8px,0.7vw,14px)] text-base text-pretty",
              plain ? "text-white/90" : "text-white/85",
              plain && "max-sm:mt-[1.4vw] max-sm:text-[3.5vw] max-sm:leading-[1.4]",
            )}
          >
            {footLeft}
          </div>
        )}
      </div>
      {footRight && <div className="relative mt-auto pt-4 text-base">{footRight}</div>}
    </>
  );
  const body = layout === "top" ? top : (
    <>
      {image && (
        <>
          <Media
            image={image}
            phone={imagePhone}
            sizes={imageSizes}
            priority={priority}
            className="transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
          />
          {/* Shade so the badge and the text stay readable on any image. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.3)_0%,rgb(0_0_0/0)_22%,rgb(0_0_0/0)_36%,rgb(0_0_0/0.6)_62%,rgb(0_0_0/0.9)_100%)]"
          />
        </>
      )}
      {logo ? (
        // The client's logo in white, in a pill as tall as the round badge. Logos of every shape look the same
        // size: a long wordmark is drawn lower, a compact one taller (same area), up to just over half the pill.
        <span
          aria-hidden="true"
          className="relative flex h-[clamp(40px,3.42vw,65px)] shrink-0 items-center self-start rounded-full bg-black/60 px-[clamp(16px,1.37vw,26px)]"
        >
          <span
            className="block bg-current"
            style={{
              height: `${Math.min(56, (84 * (logo.size ?? 1)) / Math.sqrt(logo.ratio)).toFixed(1)}%`,
              aspectRatio: logo.ratio,
              WebkitMask: `url(${logo.src}) center / contain no-repeat`,
              mask: `url(${logo.src}) center / contain no-repeat`,
            }}
          />
        </span>
      ) : (
        <span
          aria-hidden="true"
          className="relative grid size-[clamp(40px,3.42vw,65px)] shrink-0 place-items-center rounded-full bg-black/60 text-[length:clamp(13px,1.05vw,20px)] font-semibold"
        >
          {badge}
        </span>
      )}

      <div className="relative mt-auto pt-4">
        {label && <p className="mb-[clamp(6px,0.5vw,10px)] text-small text-white/75">{label}</p>}
        <div className="flex items-end justify-between gap-6">
          <Title className="min-w-0 text-[length:clamp(30px,3.15vw,60px)] leading-[1.02] font-semibold tracking-[-0.02em] text-balance">
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
          <div className="mt-[clamp(10px,0.9vw,18px)] flex items-end justify-between gap-6 text-base">
            <div className="min-w-0 text-white/80">{footLeft}</div>
            <div className="shrink-0 text-right">{footRight}</div>
          </div>
        )}
      </div>
    </>
  );

  const cls = cn(
    "on-dark group relative flex h-full flex-col overflow-hidden rounded-card bg-coal text-white lg:min-h-[calc((100cqw-var(--spacing-gap))*0.397)]",
    // Top layout keeps the card near the photo's own shape, so its subject is never cropped away.
    layout === "top"
      ? cn(
          "p-[clamp(20px,2.3vw,44px)] pt-[clamp(30px,3.6vw,68px)] sm:aspect-[4/3] lg:aspect-auto",
          // Phones: the same height as the work cards (460px), so every big card on a phone matches.
          "max-sm:min-h-[460px]",
          plain && "max-sm:p-[4.2vw] max-sm:pt-[8.5vw]",
        )
      : "min-h-[460px] p-[clamp(24px,3.05vw,58px)] sm:min-h-[540px]",
    className,
  );
  return href ? (
    <Link href={href} replace={replace} scroll={scroll} data-reveal data-cursor={cursor} className={cls}>
      {body}
    </Link>
  ) : (
    <div data-reveal className={cls}>
      {body}
    </div>
  );
}
