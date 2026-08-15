import { useCallback, useState } from "react";
import { sectionRefs } from "./lib/navigation";
import Arrival from "./components/sections/Arrival";
import BackgroundStage from "./components/media/BackgroundStage";
import TheCraft from "./components/sections/TheCraft";
import TheHuman from "./components/sections/TheHuman";
import TheNextJourney from "./components/sections/TheNextJourney";
import ThePath from "./components/sections/ThePath";
import TheWork from "./components/sections/TheWork";
import ExperienceIntro from "./components/intro/ExperienceIntro";
import Navbar from "./components/navigation/Navbar";
import { useActiveSection } from "./hooks/useActiveSection";
import { useSectionTransitions } from "./hooks/useSectionTransitions";

/**
 * Once-per-tab session flag (sessionStorage, never localStorage). Written ONLY
 * on ENTER — never on mount, never on page load. A reload in the same tab
 * reads it and skips the intro; a fresh tab has its own independent
 * sessionStorage and sees the intro again.
 */
const EXPERIENCE_INTRO_SEEN_KEY = "portfolio-experience-intro-seen";

/** Session storage can throw in hardened/private contexts — degrade to "not seen". */
const isExperienceIntroSeen = (): boolean => {
  try {
    return sessionStorage.getItem(EXPERIENCE_INTRO_SEEN_KEY) !== null;
  } catch {
    return false;
  }
};

const markExperienceIntroSeen = (): void => {
  try {
    sessionStorage.setItem(EXPERIENCE_INTRO_SEEN_KEY, "1");
  } catch {
    /* Unavailable — the intro simply presents again on the next reload. */
  }
};

/**
 * One-page composition. The cinematic ExperienceIntro opens the world: the
 * visitor's ENTER click is the user-activation event that starts the Hero
 * video and the shared ambient music together, then the intro dissolves away.
 * It shows only once per tab — a reload in the same tab skips it and starts
 * the Hero flow immediately. One IntersectionObserver tracks the active
 * chapter; the transition director reveals entering content while the shared
 * BackgroundStage crossfades chapter artwork behind the flow.
 */
export default function App() {
  const [heroActive, setHeroActive] = useState(isExperienceIntroSeen);
  const handleStart = useCallback(() => {
    setHeroActive(true);
    markExperienceIntroSeen();
  }, []);

  const activeRef = useActiveSection(sectionRefs);
  useSectionTransitions(sectionRefs, activeRef);

  return (
    <>
      {heroActive && (
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
      )}
      {!heroActive && <ExperienceIntro onStart={handleStart} />}
      <Navbar activeRef={activeRef} />
      <BackgroundStage sectionRefs={sectionRefs} activeRef={activeRef} />
      <main id="main">
        <Arrival start={heroActive} />
        <ThePath />
        <TheCraft />
        <TheWork />
        <TheHuman />
        <TheNextJourney />
      </main>
    </>
  );
}
