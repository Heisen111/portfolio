import { useEffect, useState } from "react";

/**
 * Tracks the chapter currently occupying the viewport's reading band
 * (50–55% from the top). Exactly one full-height section can cross the band,
 * so IntersectionObserver stays deterministic. The band's position matches
 * the fixed nav without hardcoding offsets.
 */
export function useActiveSection(sectionRefs: string[]): string | null {
  const [active, setActive] = useState<string | null>(sectionRefs[0] ?? null);

  useEffect(() => {
    const elements = sectionRefs
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: "-50% 0px -45% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionRefs]);

  return active;
}
