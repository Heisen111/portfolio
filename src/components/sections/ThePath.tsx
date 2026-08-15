import type { CSSProperties } from "react";
import { chapters } from "../../lib/navigation";
import { journey } from "../../content/journey";

const chapter = chapters[1];

/** Stagger between stage reveals on chapter enter (see PROMPT 08 pseudocode). */
const STAGE_STAGGER_MS = 120;

/**
 * 02 — THE PATH. Editorial progression, not a résumé timeline: three stages
 * (Computer Science → Web3 → AI) in a quiet vertical column, plus one
 * restrained milestone line. The chapter artwork lives in the shared
 * BackgroundStage compositor; this section carries content only (no
 * wallpaper, no scrim — the artwork itself provides the atmosphere).
 * Entrance reveals are driven by the shared chapter-transition director
 * (`data-reveal` on the section): the heading rises 24px, each stage rises
 * 16px on a 120ms stagger. All content renders typed data from
 * `src/content/journey.ts` — no hardcoded copy.
 */
export default function ThePath() {
  return (
    <section
      className="chapter chapter--path section-reveal"
      id={chapter.sectionRef}
      aria-label={chapter.label}
    >
      <div className="chapter__content">
        <header className="chapter__head">
          <p className="chapter__index">{chapter.index}</p>
          <h1 className="chapter__title">{chapter.label}</h1>
        </header>

        <ol className="path__stages">
          {journey.stages.map((stage, i) => (
            <li
              key={stage.label}
              className="path__stage"
              style={{ "--reveal-delay": `${i * STAGE_STAGGER_MS}ms` } as CSSProperties}
            >
              <span className="path__stage-index" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="path__stage-body">
                <h2 className="path__stage-title">{stage.label}</h2>
                <p className="path__stage-text">{stage.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div
          className="path__milestones"
          style={
            {
              "--reveal-delay": `${journey.stages.length * STAGE_STAGGER_MS + 150}ms`,
            } as CSSProperties
          }
        >
          <p className="path__milestones-label">Milestones</p>
          <ul className="path__milestones-list">
            {journey.milestones.map((milestone) => (
              <li key={milestone.title} className="path__milestone">
                {milestone.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
