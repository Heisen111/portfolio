import type { CSSProperties } from "react";
import { chapters } from "../../lib/navigation";
import { craft } from "../../content/craft";

const chapter = chapters[2];

/** Base delay before the first term of the first group reveals. */
const TERM_BASE_MS = 200;
/** Stagger between technical terms on chapter enter (see PROMPT 08 pseudocode). */
const TERM_STAGGER_MS = 90;

/**
 * 03 — THE CRAFT. Technical terms as editorial typography — no bars, cards,
 * or percentages. The chapter artwork lives in the shared BackgroundStage
 * compositor; this section carries content only (no wallpaper, no scrim —
 * the artwork itself provides the atmosphere). The craft-ink.webp wallpaper
 * carries its own strong ink-brush composition, so the large foreground
 * sumi-e stroke was removed (PROMPT 12): the section is now wallpaper +
 * editorial typography + small restrained accents. On chapter enter the
 * heading rises and each technical term reveals on a 90ms cascade. Renders
 * typed data from `src/content/craft.ts` only.
 */
export default function TheCraft() {
  let offsetMs = TERM_BASE_MS;

  return (
    <section
      className="chapter chapter--craft section-reveal"
      id={chapter.sectionRef}
      aria-label={chapter.label}
    >
      <div className="chapter__content">
        <header className="chapter__head">
          <p className="chapter__index">{chapter.index}</p>
          <h1 className="chapter__title">{chapter.label}</h1>
        </header>

        <p className="craft__position">{craft.positioning}</p>

        {craft.groups.map((group) => {
          const groupDelay = offsetMs;
          const terms = group.skills.map((skill, i) => {
            const delay = offsetMs + i * TERM_STAGGER_MS;
            return (
              <li
                key={skill.name}
                className="craft__term"
                style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
              >
                <span className="craft__term-name">{skill.name}</span>
                {skill.note && (
                  <span className="craft__term-note">{skill.note}</span>
                )}
              </li>
            );
          });
          offsetMs += group.skills.length * TERM_STAGGER_MS;
          return (
            <div className="craft__group" key={group.label}>
              <p
                className="craft__group-label"
                style={
                  { "--reveal-delay": `${groupDelay}ms` } as CSSProperties
                }
              >
                {group.label}
              </p>
              <ul className="craft__terms">{terms}</ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
