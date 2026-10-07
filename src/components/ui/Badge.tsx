import { cn } from "@/lib/utils";

/**
 * Round badge with text set around its edge and the mark in the middle,
 * slowly turning, as in the reference. Decorative.
 */
export function Badge({ text, mark, id = "badge", className }: { text: string; mark: string; id?: string; className?: string }) {
  const r = 82;
  const circumference = 2 * Math.PI * r;
  return (
    <div aria-hidden="true" className={cn("relative size-[clamp(96px,calc(2.4vw+86px),140px)]", className)}>
      <svg viewBox="0 0 200 200" className="spin-slow absolute inset-0 size-full">
        <defs>
          <path id={`${id}-circle`} d={`M 100 100 m -${r} 0 a ${r} ${r} 0 1 1 ${r * 2} 0 a ${r} ${r} 0 1 1 -${r * 2} 0`} />
        </defs>
        <text fontSize="14.8" fontWeight="500" letterSpacing="1.2" fill="currentColor" className="uppercase">
          <textPath href={`#${id}-circle`} textLength={circumference - 4} lengthAdjust="spacing">
            {text.toUpperCase()}
          </textPath>
        </text>
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[length:clamp(30px,calc(0.9vw+26px),46px)] font-semibold tracking-[-0.04em]">
        {mark}
      </span>
    </div>
  );
}
