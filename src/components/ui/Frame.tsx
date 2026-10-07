import { cn } from "@/lib/utils";

/**
 * Showcase frame from the reference's website pages: a charcoal card holding a
 * near-black stage, with the media inset and lifted by a soft shadow.
 * `inset` sets how much stage shows around the media.
 */
export function Frame({
  children,
  inset = "md",
  className,
  mediaClassName,
}: {
  children: React.ReactNode;
  inset?: "sm" | "md" | "lg";
  className?: string;
  mediaClassName?: string;
}) {
  const pad = {
    sm: "px-[6%] py-[6%] sm:px-[9%] sm:py-[8%]",
    md: "px-[6%] py-[6%] sm:px-[11%] sm:py-[8%]",
    lg: "px-[7%] py-[7%] sm:px-[13%] sm:pt-[10%] sm:pb-[9%]",
  }[inset];
  return (
    <div className={cn("rounded-card bg-coal p-[clamp(8px,2.6%,45px)]", className)}>
      <div className={cn("relative overflow-hidden rounded-[clamp(4px,0.4vw,7px)] bg-night", pad)}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 55% at 50% 58%, rgb(255 255 255 / 0.05) 0%, transparent 70%), radial-gradient(120% 60% at 50% 120%, rgb(255 255 255 / 0.04) 0%, transparent 60%)",
          }}
        />
        <div
          className={cn(
            "relative overflow-hidden rounded-[3px] bg-[#1d2226] shadow-[0_24px_60px_-12px_rgb(0_0_0/0.6)]",
            mediaClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
