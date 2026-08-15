import { useEffect, useState } from "react";

export interface BackgroundStageState {
  /** Index of the outgoing chapter's artwork, -1 when none (initial state). */
  prevIndex: number;
  /** Index of the chapter whose artwork fills the stage. */
  currentIndex: number;
  /** Bump on every chapter change — keys the prev-artwork and veil elements
      so their one-shot CSS animations replay even for repeated chapters. */
  transitionId: number;
}

/**
 * Background-compositor state for the shared cinematic background layer.
 *
 * Mirrors the chapter-transition director (both key off `activeRef`):
 * whenever the active chapter changes, the outgoing artwork moves to the
 * `prev` slot and the incoming one becomes `current`, bumping a transition
 * id. The `BackgroundStage` component renders only two <img> elements
 * (prev + current) plus a parchment veil, so every other artwork stays
 * unrendered/unloaded until its chapter is actually reached.
 *
 * Reduced motion needs no branching here: base.css collapses all animation
 * durations, so the crossfade/veil resolve instantly to their final state.
 */
export function useBackgroundStage(
  sectionRefs: string[],
  activeRef: string | null,
): BackgroundStageState {
  const [state, setState] = useState<BackgroundStageState>({
    prevIndex: -1,
    currentIndex: 0,
    transitionId: 0,
  });

  useEffect(() => {
    if (!activeRef) return;
    const next = sectionRefs.indexOf(activeRef);
    if (next === -1) return;

    setState((s) => {
      if (s.currentIndex === next) return s;
      return {
        prevIndex: s.currentIndex,
        currentIndex: next,
        transitionId: s.transitionId + 1,
      };
    });
  }, [activeRef, sectionRefs]);

  return state;
}