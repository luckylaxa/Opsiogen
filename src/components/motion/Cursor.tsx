"use client";

import { useEffect, useRef, useState } from "react";

type State = "default" | "link" | "view" | "text";

const LINKS = "a, button, [role='button'], select, summary, label, input[type='checkbox'], input[type='radio']";
const TEXT = "input:not([type='checkbox']):not([type='radio']):not([type='submit']):not([type='button']), textarea, [contenteditable='true']";

/** Cursor state for whatever is under the pointer: `data-cursor` wins, then links and text fields. */
function stateFor(target: EventTarget | null): State {
  if (!(target instanceof Element)) return "default";
  const marked = target.closest<HTMLElement>("[data-cursor]");
  if (marked) return (marked.dataset.cursor as State) || "link";
  if (target.closest(TEXT)) return "text";
  if (target.closest(LINKS)) return "link";
  return "default";
}

/**
 * The design system's custom cursor: a 10px dot that trails the pointer,
 * grows into a 56px ring over links and buttons, becomes a 104px “View”
 * disc over work (`data-cursor="view"`) and a thin caret over text fields.
 * The dot and ring invert what is under them, so they read on light and
 * dark surfaces alike. Off for touch screens and reduced motion; the
 * native cursor stays in those cases.
 */
export function Cursor() {
  const el = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(fine.matches && !calm.matches);
    update();
    fine.addEventListener("change", update);
    calm.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      calm.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const node = el.current;
    if (!enabled || !node) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");

    let tx = -100;
    let ty = -100;
    let x = tx;
    let y = ty;
    let raf = 0;
    let shown = false;

    const loop = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.1 ? requestAnimationFrame(loop) : 0;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      if (!shown) {
        x = tx;
        y = ty;
        shown = true;
        node.removeAttribute("data-hidden");
      }
      const state = stateFor(e.target);
      if (node.dataset.state !== state) node.dataset.state = state;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const leave = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        shown = false;
        node.setAttribute("data-hidden", "");
      }
    };
    const down = () => node.setAttribute("data-pressed", "");
    const up = () => node.removeAttribute("data-pressed");

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("mouseout", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("mouseout", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={el} aria-hidden="true" className="cursor" data-state="default" data-hidden="">
      <span className="cursor__dot">
        <span className="cursor__label">View</span>
      </span>
    </div>
  );
}
