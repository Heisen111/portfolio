import { useEffect } from "react";
import type { RefObject } from "react";

/**
 * Drives the `.content-mask` navbar-recede effect: a per-pixel mask gradient
 * glued to the viewport top so content passing under the floating nav fades
 * out smoothly. Call it PER masked wrapper — the chapters wrapper in App.tsx
 * and the hero's content wrapper in Arrival — leaving media layers (hero
 * video, BackgroundStage artwork) outside any mask so they stay 100% visible.
 *
 * Writes two CSS variables:
 *   --scroll-y      → current scroll offset in px (document root, shared)
 *   --content-top   → THIS element's document offset (set on the element
 *                     itself, so each masked wrapper tracks its own geometry
 *                     — a hero growing taller than 100svh can never skew it)
 * The CSS in chapters.css turns these into a fade band that tracks the nav.
 *
 * One passive rAF-throttled scroll listener; no state, no re-renders.
 */
export function useContentMask(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;

    let ticking = false;
    const apply = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        root.style.setProperty("--scroll-y", `${window.scrollY}px`);
        el.style.setProperty("--content-top", `${el.offsetTop}px`);
        ticking = false;
      });
    };

    apply();
    window.addEventListener("scroll", apply, { passive: true });
    window.addEventListener("resize", apply);
    // Font swap / lazy media can shift the hero height → re-measure the
    // wrapper offset without ever re-rendering React.
    const resizeObserver = new ResizeObserver(apply);
    resizeObserver.observe(document.body);
    return () => {
      window.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
      resizeObserver.disconnect();
    };
  }, [ref]);
}