import { useState } from "react";
import type { TransitionEvent } from "react";
import { profile } from "../../content/profile";
import { experienceIntro } from "../../content/intro";
import { ambientAudio } from "../../lib/ambientAudio";

/** Locked decorative asset — supports the composition, never dominates.
    Production copy: same aspect as the original, ~1/40 of the bytes, and the
    stroke is CSS-sized anyway, so the render is byte-identical. */
const SUMI_E_STROKE_SRC = "/assets/decoratives/production/main-sumi-e-ink-stroke.png";

type Phase = "show" | "leaving" | "gone";

interface ExperienceIntroProps {
  /** Called once on ENTER — starts the Hero through the existing mechanism. */
  onStart: () => void;
}

/**
 * Cinematic, user-controlled opening frame — a world to enter, not a loader.
 * A static parchment composition (AADI / invitation / ENTER) with NO timed or
 * automatic dismissal: the visitor stays until they choose to enter. On
 * ENTER — a real <button>, the browser's user-activation event — the shared
 * ambient audio and the Hero video begin together (~sync), then the cover
 * dissolves over ~1s (CSS opacity/transform) and unmounts itself via
 * `transitionend`, so there are no timers anywhere. Reduced motion collapses
 * the dissolve via base.css; the intro itself keeps working.
 */
export default function ExperienceIntro({ onStart }: ExperienceIntroProps) {
  const [phase, setPhase] = useState<Phase>("show");

  const begin = () => {
    if (phase !== "show") return;
    setPhase("leaving");
    onStart();
    ambientAudio.play().catch(() => {
      /* Media/browser rejection — remain quiet; the navbar control is the
         manual fallback. Never retry, never surface an error. */
    });
  };

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (phase === "leaving" && event.target === event.currentTarget) {
      setPhase("gone");
    }
  };

  if (phase === "gone") return null;

  return (
    <div
      className="experience-intro"
      data-phase={phase}
      aria-hidden={phase !== "show"}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="experience-intro__content">
        <p className="experience-intro__aadi">{profile.monogram}</p>
        <img
          className="experience-intro__stroke"
          src={SUMI_E_STROKE_SRC}
          alt=""
          draggable={false}
        />
        <p className="experience-intro__quote">{experienceIntro.quote}</p>
        <button
          type="button"
          className="experience-intro__enter"
          onClick={begin}
          aria-label="Enter the experience"
        >
          <span className="experience-intro__enter-label">
            {experienceIntro.enter}
          </span>
          <span className="experience-intro__enter-line" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}