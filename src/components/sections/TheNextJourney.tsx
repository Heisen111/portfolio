import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { chapters } from "../../lib/navigation";
import { profile } from "../../content/profile";
import { socials } from "../../content/socials";
import { finalJourney } from "../../content/final";

const chapter = chapters[5];

/**
 * The portfolio guide is code-split and only rendered when the visitor
 * actually reaches THE NEXT JOURNEY — the AI feature never loads on entry,
 * so the opening of the film stays light.
 */
const AiConversation = lazy(() => import("../ai/AiConversation"));

/** Mount the guide once the closing chapter is approaching the viewport. */
const GUIDE_IN_VIEW_THRESHOLD = 0.1;

/**
 * 06 — THE NEXT JOURNEY. The portfolio closes like end credits: chapter
 * heading, one quiet closing line, the AADI monogram, then a row of real
 * semantic <a> social links (no contact form, no CTA button). Human-readable
 * labels read from `src/content/socials.ts`; every URL is the true handle,
 * email uses mailto:. External links open in a new tab.
 *
 * After the credits, an editorial portfolio guide (AI Q&A) invites the
 * visitor to ask about the work. It lazily mounts when the section scrolls
 * into view, keeps the existing composition untouched, and renders typed
 * data only — nothing is hardcoded in the component.
 */
export default function TheNextJourney() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [guideInView, setGuideInView] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setGuideInView(true);
          observer.disconnect();
        }
      },
      { threshold: GUIDE_IN_VIEW_THRESHOLD },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="chapter chapter--journey section-reveal"
      id={chapter.sectionRef}
      aria-label={chapter.label}
    >
      <div className="chapter__content">
        <header className="chapter__head">
          <p className="chapter__index">{chapter.index}</p>
          <h1 className="chapter__title">{chapter.label}</h1>
        </header>

        <p
          className="journey__closing"
          style={{ "--reveal-delay": "120ms" } as CSSProperties}
        >
          {finalJourney.closing}
        </p>

        <p
          className="journey__aadi"
          style={{ "--reveal-delay": "320ms" } as CSSProperties}
        >
          {profile.monogram}
        </p>

        <ul
          className="journey__links"
          style={{ "--reveal-delay": "480ms" } as CSSProperties}
        >
          {socials.map((social) => (
            <li key={social.id}>
              <a
                className="journey__link"
                href={social.url}
                {...(social.id !== "email"
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
              >
                {social.label}
              </a>
            </li>
          ))}
        </ul>

        {guideInView && (
          <Suspense fallback={null}>
            <AiConversation />
          </Suspense>
        )}
      </div>
    </section>
  );
}