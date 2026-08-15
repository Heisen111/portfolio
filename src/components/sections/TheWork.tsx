import type { CSSProperties } from "react";
import { chapters } from "../../lib/navigation";
import { projects } from "../../content/projects";

const chapter = chapters[3];

/** Stagger between project reveals on chapter enter. */
const PROJECT_STAGGER_MS = 120;

/**
 * 04 — THE WORK. Four project chapters as a curated editorial sequence —
 * one block per project (number, title, one-line description, stack,
 * repository links), never a card grid. BVS is ONE project with TWO
 * repositories, both rendered as real links.
 *
 * Focus interaction (PROMPT 09): while a project is focused (keyboard
 * `:focus-within` — clicking/tapping a real <a> also focuses it), the
 * shared background quiets (opacity 1→0.40, blur 0→4px, 650ms) and the
 * OTHER projects recede to 0.55 (300ms). Implemented in CSS `:has`, so
 * touch never depends on hover and keyboard gets the identical state.
 */
export default function TheWork() {
  return (
    <section
      className="chapter chapter--work section-reveal"
      id={chapter.sectionRef}
      aria-label={chapter.label}
    >
      <div className="chapter__content">
        <header className="chapter__head">
          <p className="chapter__index">{chapter.index}</p>
          <h1 className="chapter__title">{chapter.label}</h1>
        </header>

        <ol className="work__list">
          {projects.map((project, i) => (
            <li
              key={project.id}
              className="work__project"
              style={
                { "--reveal-delay": `${i * PROJECT_STAGGER_MS}ms` } as CSSProperties
              }
            >
              <span className="work__project-index" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="work__project-body">
                <h2 className="work__project-title">{project.title}</h2>
                <p className="work__project-tagline">{project.tagline}</p>
                <p className="work__project-description">{project.description}</p>

                <ul className="work__project-tech">
                  {project.tech.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                {project.origin && (
                  <p className="work__project-note">{project.origin}</p>
                )}
                {project.note && (
                  <p className="work__project-note">{project.note}</p>
                )}

                {project.repositories.length > 0 && (
                  <ul className="work__project-links">
                    {project.repositories.map((repo) => (
                      <li key={repo.url}>
                        <a
                          className="work__project-link"
                          href={repo.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {repo.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}