"use client";

import { useState } from "react";

/**
 * Pauses and restarts the scrolling row of logos just above it (moving content that runs on needs a way to stop it,
 * WCAG 2.2.2). Hidden for visitors who prefer less motion: their row doesn't move.
 */
export function MarqueePause() {
  const [paused, setPaused] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={paused}
      aria-label={paused ? "Play the scrolling logos" : "Pause the scrolling logos"}
      onClick={(e) => {
        const row = e.currentTarget.closest("section")?.querySelector(".marquee");
        row?.toggleAttribute("data-paused", !paused);
        setPaused(!paused);
      }}
      className="marquee-pause grid size-8 place-items-center rounded-full text-mute transition-colors hover:text-ink focus-visible:text-ink"
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 fill-current">
        {paused ? <path d="M4 2.5v11l9-5.5z" /> : <path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" />}
      </svg>
    </button>
  );
}
