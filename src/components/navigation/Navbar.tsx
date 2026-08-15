import { useCallback, useEffect, useRef, useState } from "react";
import { chapters, chapterCount, navigateToSection } from "../../lib/navigation";
import { navChrome } from "../../content/navigation";
import { profile } from "../../content/profile";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { ChapterMenu } from "./ChapterMenu";
import MusicControl from "./MusicControl";

interface NavbarProps {
  activeRef: string | null;
}

/**
 * Floating minimal nav. Desktop: AADI + current chapter ("01 / 06 · ARRIVAL")
 * opening the chapter list. Mobile: AADI + MENU with a compact full-screen
 * menu. Never dominates the artwork; no hover-only functionality.
 */
export default function Navbar({ activeRef }: NavbarProps) {
  const reduced = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 960px)");
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const rootRef = useRef<HTMLElement | null>(null);
  const indicatorRef = useRef<HTMLButtonElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const wasMobileOpen = useRef(false);
  const wasDesktopOpen = useRef(false);

  const activeIndex = Math.max(
    0,
    chapters.findIndex((chapter) => chapter.sectionRef === activeRef),
  );
  const activeChapter = chapters[activeIndex];

  const handleNavigate = useCallback(
    (id: string) => {
      setDesktopOpen(false);
      setMobileOpen(false);
      navigateToSection(id, reduced);
    },
    [reduced],
  );

  // Close on Escape and on outside clicks (desktop panel).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDesktopOpen(false);
        setMobileOpen(false);
      }
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) {
        setDesktopOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onClick);
    };
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    if (mobileOpen) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [mobileOpen]);

  // Return focus to the MENU trigger when the mobile menu closes.
  useEffect(() => {
    if (wasMobileOpen.current && !mobileOpen) {
      menuButtonRef.current?.focus();
    }
    wasMobileOpen.current = mobileOpen;
  }, [mobileOpen]);

  // Return focus to the indicator when the desktop panel closes.
  useEffect(() => {
    if (wasDesktopOpen.current && !desktopOpen) {
      indicatorRef.current?.focus();
    }
    wasDesktopOpen.current = desktopOpen;
  }, [desktopOpen]);

  return (
    <header className={`nav nav--${activeChapter.theme}`} ref={rootRef}>
      <a
        className="nav__brand"
        href="#arrival"
        onClick={(event) => {
          event.preventDefault();
          handleNavigate("arrival");
        }}
      >
        {profile.monogram}
      </a>

      <div className="nav__actions">
        <button
          ref={indicatorRef}
          type="button"
          className="nav__indicator"
          aria-haspopup="menu"
          aria-expanded={desktopOpen}
          aria-controls="chapter-menu-desktop"
          aria-label={`Chapters — current: ${activeChapter.label}`}
          onClick={() => setDesktopOpen((open) => !open)}
        >
          <span className="nav__indicator-index">
            {activeChapter.index} / {String(chapterCount).padStart(2, "0")}
          </span>
          <span className="nav__indicator-label">{activeChapter.label}</span>
        </button>

        <button
          ref={menuButtonRef}
          type="button"
          className="nav__menu-btn"
          aria-haspopup="menu"
          aria-expanded={mobileOpen}
          aria-controls="chapter-menu-mobile"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {navChrome.menu}
        </button>

        <MusicControl />
      </div>

      <ChapterMenu
        variant="desktop"
        menuId="chapter-menu-desktop"
        open={isDesktop && desktopOpen}
        activeRef={activeRef}
        onNavigate={handleNavigate}
      />
      <ChapterMenu
        variant="mobile"
        menuId="chapter-menu-mobile"
        open={!isDesktop && mobileOpen}
        activeRef={activeRef}
        onNavigate={handleNavigate}
        onClose={() => setMobileOpen(false)}
      />
    </header>
  );
}
