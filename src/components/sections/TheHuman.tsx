import { useEffect, useRef, useState } from "react";
import { chapters } from "../../lib/navigation";
import { human } from "../../content/human";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const chapter = chapters[4];

/** Hold time per photograph before the slow editorial crossfade starts. */
const HOLD_MS = 5000;

/**
 * 05 — THE HUMAN. A quiet pause in the portfolio: the personal statement
 * occupies the left editorial column while ONE photograph at a time sits in
 * a small 3:4 frame on the right (a print placed on parchment, never a
 * gallery). The photographs rotate through a slow automatic loop: React
 * state advances the index every ~5s and CSS crossfades opacity + a whisper
 * of translateX (~1000ms) — no carousel UI, no arrows, dots, or controls.
 *
 * Reduced motion: the interval never starts and only the first photograph is
 * rendered as one stable image (no transitions via base.css). Photographs
 * keep their native aspect (contained in the frame, never cropped/stretched)
 * and every image carries meaningful alt text from `src/content/human.ts`.
 *
 * The rotation only ticks while the section is on screen—an offscreen 5s
 * timer would rerender the section (and decode nothing, but burn cycles) for
 * no one. Intersecting sections resume exactly where they left off.
 */
export default function TheHuman() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const images = reduced
    ? human.photography.images.slice(0, 1)
    : human.photography.images;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.25 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduced) {
      setIndex(0);
      return;
    }
    if (!visible || images.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, HOLD_MS);
    return () => window.clearInterval(timer);
  }, [reduced, visible, images.length]);

  return (
    <section
      ref={sectionRef}
      className="chapter chapter--human section-reveal"
      id={chapter.sectionRef}
      aria-label={chapter.label}
    >
      <div className="chapter__content">
        <div className="human__text">
          <header className="chapter__head">
            <p className="chapter__index">{chapter.index}</p>
            <h1 className="chapter__title">{chapter.label}</h1>
          </header>

          <p className="human__lead">{human.intro}</p>

          <div className="human__interests">
            <p className="human__interests-label">Interests</p>
            <ul className="human__interests-list">
              {human.interests.map((interest) => (
                <li key={interest} className="human__interest">
                  {interest}
                </li>
              ))}
            </ul>
          </div>

          <p className="human__note">{human.photography.note}</p>
        </div>

        <div
          className="human__stage"
          aria-label="Personal photograph"
          aria-live="off"
        >
          {images.map((photo, i) => (
            <figure
              key={photo.src}
              className={
                i === index ? "human__photo human__photo--active" : "human__photo"
              }
              aria-hidden={i !== index}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                decoding="async"
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}