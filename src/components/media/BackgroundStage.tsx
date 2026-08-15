import { useEffect } from "react";
import { chapters } from "../../lib/navigation";
import { useBackgroundStage } from "../../hooks/useBackgroundStage";

/**
 * Shared cinematic background compositor (one fixed layer, whole page).
 *
 * Replaces per-section full-bleed wallpapers, so artworks never meet at a
 * hard section edge. While a chapter is active its artwork fills the fixed
 * stage behind the normal-flow content sections (drawn at z-index -1, so
 * every section paints above it and the hero media layer is untouched).
 *
 * ARRIVAL has no compositor artwork: the hero section renders its own media
 * layer (poster → video A → video B), so the Hero Master is a true fallback
 * there — it is never duplicated as a second background layer behind the
 * live video. Transitions into/out of ARRIVAL simply fade the artwork in or
 * out over the parchment canvas beneath.
 *
 * On a chapter change:
 *   prev artwork:    opacity 1 → 0                     (fade out, 850ms)
 *   current artwork: opacity 0 → 1, scale 1.015 → 1   (settle in, 850ms)
 *
 * The two layers simply crossfade — the blend IS the transition (no overlay,
 * no veil). The page canvas beneath is parchment (base.css), so a light
 * parchment ground is always present and a black/white gap can never appear.
 *
 * Only prev + current <img> elements exist at any time; every chapter
 * artwork is preloaded once at mount so a crossfade never waits on the
 * network (requests happen once, never per transition). Reduced motion
 * collapses everything via base.css.
 */
export default function BackgroundStage({
  sectionRefs,
  activeRef,
}: {
  sectionRefs: string[];
  activeRef: string | null;
}) {
  const { prevIndex, currentIndex, transitionId } = useBackgroundStage(
    sectionRefs,
    activeRef,
  );

  const prevChapter = prevIndex >= 0 ? chapters[prevIndex] : null;
  const currentChapter = chapters[currentIndex];

  // Warm each chapter's artwork lazily as it approaches the viewport instead
  // of decoding all ~1 MB at mount: the crossfade still never waits on the
  // network (the render below also fetches), but below-fold art is not
  // decoded until the visitor is actually heading toward it.
  useEffect(() => {
    const warmed = new Set<string>();
    const targets = chapters
      .filter((chapter) => chapter.artwork)
      .map((chapter) => {
        const element = document.getElementById(chapter.sectionRef);
        if (!element) return null;
        return { chapter, element };
      })
      .filter(
        (entry): entry is { chapter: (typeof chapters)[number]; element: HTMLElement } =>
          entry !== null && entry.chapter.artwork !== undefined,
      );
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = targets.find((t) => t.element === entry.target);
          if (!target?.chapter.artwork || warmed.has(target.chapter.artwork)) continue;
          warmed.add(target.chapter.artwork);
          const image = new Image();
          image.src = target.chapter.artwork;
        }
      },
      { rootMargin: "600px 0px", threshold: 0 },
    );

    targets.forEach(({ element }) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="background-stage" aria-hidden="true">
      {prevChapter?.artwork && (
        <img
          key={`prev-${transitionId}`}
          className="background-stage__prev"
          src={prevChapter.artwork}
          alt=""
          decoding="async"
        />
      )}
      {currentChapter.artwork && (
        <img
          key={`current-${currentIndex}`}
          className="background-stage__current"
          src={currentChapter.artwork}
          alt=""
          decoding="async"
        />
      )}
    </div>
  );
}