import { useRef } from "react";
import { chapters } from "../../lib/navigation";
import { profile } from "../../content/profile";
import { heroCopy } from "../../content/hero";
import { HeroMedia } from "../media/HeroMedia";
import { useHeroQuoteReveal } from "../../hooks/useHeroQuoteReveal";
import { useContentMask } from "../../hooks/useContentMask";

const chapter = chapters[0];

/**
 * 01 — ARRIVAL. Intentionally sparse: media, monogram, title line,
 * quote with the Japanese ink-reveal interaction, and a quiet scroll cue.
 */
export default function Arrival({ start = true }: { start?: boolean }) {
  const quoteRef = useRef<HTMLElement>(null);
  useHeroQuoteReveal(quoteRef);
  // Only the hero's TEXT content recedes under the navbar — the video/poster
  // media stack stays outside the mask, always fully visible.
  const contentMaskRef = useRef<HTMLDivElement | null>(null);
  useContentMask(contentMaskRef);

  return (
    <section
      className="hero section-reveal"
      id={chapter.sectionRef}
      aria-label={chapter.label}
    >
      <HeroMedia start={start} />
      <div className="hero__scrim" aria-hidden="true" />

      <div className="content-mask hero__content-wrap" ref={contentMaskRef}>
        <div className="hero__content" data-reveal-target>
          <div className="hero__identity">
            <h1 className="hero__identity-name">{profile.nameMark}</h1>
            <p className="hero__identity-alias">{profile.aliasMark}</p>
          </div>
          <p className="hero__title">{profile.title}</p>
          <figure
            ref={quoteRef}
            className="hero__quote"
            tabIndex={0}
          >
            <blockquote className="hero__quote-en">
              {profile.heroQuote.en.join("\n")}
            </blockquote>
            <figcaption className="hero__quote-ja" lang="ja" aria-hidden="true">
              {profile.heroQuote.ja.join("\n")}
            </figcaption>
          </figure>
        </div>

        <p className="hero__scroll" aria-hidden="true">
          <span className="hero__scroll-label">{heroCopy.scrollCue}</span>
          <span className="hero__scroll-line" aria-hidden="true" />
        </p>
      </div>
    </section>
  );
}
