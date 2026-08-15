import { useEffect, useState } from "react";

/**
 * Media-query hook (used to switch the nav between desktop and mobile chrome).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(
    () => window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
