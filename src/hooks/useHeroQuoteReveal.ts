import { useEffect, type RefObject } from "react";
import { useMediaQuery } from "./useMediaQuery";
import { useReducedMotion } from "./useReducedMotion";

const REVEAL_RADIUS = 120;
const FEATHER_START = 0.38;
const FEATHER_END = 0.82;

/**
 * Hero quote Japanese ink-reveal — replacement, not overlay.
 *
 * Desktop (hover + fine pointer):
 *   The English layer gets an inverse mask and the Japanese layer a direct
 *   mask from the SAME soft radial gradient: inside the cursor region the
 *   English is hidden exactly where the Japanese is shown — never both
 *   readable at once. Pointer position is tracked in mutable values; one rAF
 *   loop interpolates position and radius (0.12/frame), writes both masks
 *   inline — no React state on pointer move, no library.
 *
 *   Enter: region grows from the cursor point (radius 0 → 120px); the layer
 *   fades in over --dur-fast (300ms). Leave: the region shrinks to nothing
 *   while the layer fades out over --dur-slow (650ms), then masks are
 *   cleared. Keyboard focus (focusin/focusout) pauses the loop and clears
 *   the masks so the CSS :focus-within full replacement reveal applies.
 *
 * Touch (no hover):
 *   One restrained English ↔ Japanese crossfade when the quote enters the
 *   viewport (IntersectionObserver, once — no loop).
 *
 * Reduced motion: everything is skipped; the English quote stays static.
 */
export function useHeroQuoteReveal(
  quoteRef: RefObject<HTMLElement | null>,
): void {
  const reduced = useReducedMotion();
  const canTrackPointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const isTouch = useMediaQuery("(hover: none), (pointer: coarse)");

  useEffect(() => {
    if (reduced) return;
    const quote = quoteRef.current;
    if (!quote) return;

    if (canTrackPointer) {
      const jaLayer = quote.querySelector<HTMLElement>(".hero__quote-ja");
      const enLayer = quote.querySelector<HTMLElement>(".hero__quote-en");
      if (!jaLayer || !enLayer) return;

      const target = { x: 0, y: 0 };
      const current = { x: 0, y: 0 };
      let radius = 0;
      let hovered = false;
      let focused = false;
      let running = false;
      let rafId = 0;

      const writeMasks = (x: number, y: number, r: number) => {
        const rect = quote.getBoundingClientRect();
        const px = x - rect.left;
        const py = y - rect.top;
        const visible = `#000 0%, #000 ${FEATHER_START * 100}%, rgba(0, 0, 0, 0) ${FEATHER_END * 100}%`;
        const hidden = `rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) ${FEATHER_START * 100}%, #000 ${FEATHER_END * 100}%`;
        const jaMask = `radial-gradient(circle ${r}px at ${px}px ${py}px, ${visible})`;
        const enMask = `radial-gradient(circle ${r}px at ${px}px ${py}px, ${hidden})`;
        jaLayer.style.maskImage = jaMask;
        jaLayer.style.webkitMaskImage = jaMask;
        enLayer.style.maskImage = enMask;
        enLayer.style.webkitMaskImage = enMask;
      };

      const clearMasks = () => {
        jaLayer.style.maskImage = "";
        jaLayer.style.webkitMaskImage = "";
        enLayer.style.maskImage = "";
        enLayer.style.webkitMaskImage = "";
      };

      const tick = () => {
        if (!hovered && radius < 1) {
          running = false;
          clearMasks();
          return;
        }
        const targetRadius = hovered ? REVEAL_RADIUS : 0;
        radius += (targetRadius - radius) * 0.12;
        current.x += (target.x - current.x) * 0.12;
        current.y += (target.y - current.y) * 0.12;
        writeMasks(current.x, current.y, Math.round(radius));
        rafId = requestAnimationFrame(tick);
      };

      const start = () => {
        if (running) return;
        running = true;
        rafId = requestAnimationFrame(tick);
      };
      const stop = () => {
        running = false;
        cancelAnimationFrame(rafId);
      };

      const onEnter = (event: PointerEvent) => {
        hovered = true;
        radius = 0;
        target.x = current.x = event.clientX;
        target.y = current.y = event.clientY;
        quote.classList.add("hero__quote--hovered");
        if (!focused) start();
      };
      const onMove = (event: PointerEvent) => {
        target.x = event.clientX;
        target.y = event.clientY;
      };
      const onLeave = () => {
        hovered = false;
        quote.classList.remove("hero__quote--hovered");
      };
      const onFocusIn = () => {
        focused = true;
        stop();
        clearMasks();
      };
      const onFocusOut = () => {
        focused = false;
        if (hovered) start();
      };

      quote.addEventListener("pointerenter", onEnter);
      quote.addEventListener("pointermove", onMove);
      quote.addEventListener("pointerleave", onLeave);
      quote.addEventListener("focusin", onFocusIn);
      quote.addEventListener("focusout", onFocusOut);

      return () => {
        stop();
        clearMasks();
        quote.removeEventListener("pointerenter", onEnter);
        quote.removeEventListener("pointermove", onMove);
        quote.removeEventListener("pointerleave", onLeave);
        quote.removeEventListener("focusin", onFocusIn);
        quote.removeEventListener("focusout", onFocusOut);
        quote.classList.remove("hero__quote--hovered");
      };
    }

    if (isTouch) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            quote.classList.add("hero__quote--inview");
            observer.disconnect();
          }
        },
        { threshold: 0.5 },
      );
      observer.observe(quote);
      return () => observer.disconnect();
    }
  }, [reduced, canTrackPointer, isTouch, quoteRef]);
}
