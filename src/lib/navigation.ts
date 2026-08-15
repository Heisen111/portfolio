import type { Chapter } from "../types";

/**
 * Chapter order for the one-page narrative and navigation.
 * Content only — UI reads from here and never hardcodes section order.
 */
export const chapters: Chapter[] = [
  {
    id: "arrival",
    index: "01",
    label: "ARRIVAL",
    sectionRef: "arrival",
    theme: "dark",
    // No compositor artwork: the hero section owns its own media layer
    // (poster → video A → video B). The Hero Master is a true fallback inside
    // the hero, never a second background layer behind the video.
  },
  {
    id: "path",
    index: "02",
    label: "THE PATH",
    sectionRef: "path",
    theme: "light",
    artwork: "/assets/backgrounds/journey-path.webp",
  },
  {
    id: "craft",
    index: "03",
    label: "THE CRAFT",
    sectionRef: "craft",
    theme: "light",
    artwork: "/assets/backgrounds/craft-ink.webp",
  },
  {
    id: "work",
    index: "04",
    label: "THE WORK",
    sectionRef: "work",
    theme: "dark",
    artwork: "/assets/backgrounds/work-confrontation.webp",
  },
  {
    id: "human",
    index: "05",
    label: "THE HUMAN",
    sectionRef: "human",
    theme: "dark",
    artwork: "/assets/backgrounds/human-quiet.webp",
  },
  {
    id: "journey",
    index: "06",
    label: "THE NEXT JOURNEY",
    sectionRef: "journey",
    theme: "light",
    artwork: "/assets/backgrounds/final-journey.webp",
  },
];

export const chapterCount = chapters.length;

/** Section ids in chapter order — the single source for observers and jumps. */
export const sectionRefs = chapters.map((chapter) => chapter.sectionRef);

/**
 * Natural-scroll chapter jump. Smooth unless the visitor prefers reduced
 * motion. No scroll-jacking — this is the only programmatic scroll.
 */
export function navigateToSection(id: string, reducedMotion: boolean): void {
  document.getElementById(id)?.scrollIntoView({
    behavior: reducedMotion ? "auto" : "smooth",
    block: "start",
  });
}
