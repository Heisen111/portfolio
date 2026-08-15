import { useEffect, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Drives the content reveal when a chapter becomes active, without touching
 * scroll and without any black/bright flash (the BackgroundStage handles the
 * artwork bridge with a parchment mist crossfade).
 *
 * On active-section change it marks the entering section
 * `data-reveal="down" | "up"` → CSS plays the one-shot content reveal
 * (opacity + direction-aware translateY). Works in both scroll directions;
 * reduced motion skips everything.
 */
export function useSectionTransitions(
  sectionRefs: string[],
  activeRef: string | null,
): void {
  const reduced = useReducedMotion();
  const prevIndexRef = useRef(0);

  useEffect(() => {
    if (reduced || !activeRef) return;

    const newIndex = sectionRefs.indexOf(activeRef);
    if (newIndex === -1 || newIndex === prevIndexRef.current) return;

    const direction = newIndex > prevIndexRef.current ? "down" : "up";
    prevIndexRef.current = newIndex;

    // Restart the reveal even when the same section is re-entered.
    const section = document.getElementById(activeRef);
    if (section) {
      section.removeAttribute("data-reveal");
      requestAnimationFrame(() => {
        section.setAttribute("data-reveal", direction);
      });
    }
  }, [reduced, activeRef, sectionRefs]);
}