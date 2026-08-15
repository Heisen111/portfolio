import { useEffect, useRef } from "react";
import { chapters } from "../../lib/navigation";
import { navChrome } from "../../content/navigation";
import { profile } from "../../content/profile";

interface ChapterMenuProps {
  variant: "desktop" | "mobile";
  menuId: string;
  open: boolean;
  activeRef: string | null;
  onNavigate: (id: string) => void;
  onClose?: () => void;
}

/**
 * Chapter list for both navs. Desktop = small panel under the indicator;
 * mobile = full-screen parchment overlay. Anchors with `href="#id"` keep
 * native fallback; the smooth jump happens through onNavigate.
 */
export function ChapterMenu({
  variant,
  menuId,
  open,
  activeRef,
  onNavigate,
  onClose,
}: ChapterMenuProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const firstItemRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (open) firstItemRef.current?.focus();
  }, [open]);

  // Modal focus trap for the mobile overlay: Tab / Shift+Tab cycle inside the
  // dialog instead of leaking into the page behind it (aria-modal="true").
  useEffect(() => {
    if (variant !== "mobile" || !open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const root = rootRef.current;
      if (!root) return;
      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      ).filter((el) => !el.hidden && el.offsetParent !== null);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey) {
        if (active === first || !root.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !root.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [variant, open]);

  return (
    <div
      ref={rootRef}
      id={menuId}
      className={`chapter-menu chapter-menu--${variant}`}
      hidden={!open}
      role={variant === "mobile" ? "dialog" : undefined}
      aria-modal={variant === "mobile" ? "true" : undefined}
      aria-label={variant === "mobile" ? "Menu" : undefined}
    >
      {variant === "mobile" && (
        <div className="chapter-menu__head">
          <span className="chapter-menu__brand">{profile.monogram}</span>
          <button
            type="button"
            className="chapter-menu__close"
            onClick={onClose}
          >
            {navChrome.close}
          </button>
        </div>
      )}
      <nav aria-label="Chapters">
        <ul className="chapter-menu__list">
          {chapters.map((chapter, index) => (
            <li key={chapter.id}>
              <a
                ref={index === 0 ? firstItemRef : undefined}
                className="chapter-menu__item"
                href={`#${chapter.sectionRef}`}
                aria-current={activeRef === chapter.sectionRef ? "true" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(chapter.sectionRef);
                }}
              >
                <span className="chapter-menu__index">{chapter.index}</span>
                <span className="chapter-menu__label">{chapter.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
