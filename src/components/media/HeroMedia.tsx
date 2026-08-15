import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/** Locked media sources. Do not modify the files these point to. */
export const HERO_POSTER_SRC = "/assets/hero/hero-master.jpg";
export const HERO_A_SRC = "/assets/hero/production/hero-a.mp4";
export const HERO_B_SRC = "/assets/hero/production/hero-b.mp4";

/**
 * Poster → Video A (once) → Video B (ambient loop).
 *
 * Native `<video>` only. Reduced motion and every failure path land on the
 * static Hero Master poster. A and B share the same end/start composition,
 * so the crossfade at the handoff is imperceptible.
 *
 * The Hero Master is a TRUE FALLBACK ONLY. Before playback the separate
 * `.hero__poster` <img> is the placeholder; once a video is the active
 * source the poster hides and the videos have NO native `poster` attribute
 * — the master can never repaint over a live video (e.g. a tab-blur surface
 * drop would otherwise re-draw it as a second layer). On video error the
 * `failed` stage hides the videos and the poster <img> is the fallback.
 */
type Stage = "poster" | "videoA" | "videoB" | "failed";

export function HeroMedia({ start = true }: { start?: boolean }) {
  const reduced = useReducedMotion();
  const videoARef = useRef<HTMLVideoElement | null>(null);
  const videoBRef = useRef<HTMLVideoElement | null>(null);
  const [stage, setStage] = useState<Stage>("poster");

  // Reduced motion always means the static Hero Master.
  useEffect(() => {
    if (reduced) setStage("poster");
  }, [reduced]);

  // Once the hero is revealed (start) let Video A start buffering so it can
  // play with minimal poster dwell. Until then preload="none" keeps the
  // hero's 1.26 MB from competing with the initial page load.
  useEffect(() => {
    if (reduced || !start || !videoARef.current) return;
    const a = videoARef.current;
    a.preload = "auto";
    a.load();
  }, [reduced, start]);

  // Kick off Video A once the hero is revealed (start), unless reduced.
  // Poster stays visible until playback actually starts.
  useEffect(() => {
    if (reduced || stage !== "poster" || !start) return;
    // Rejection (autoplay blocked) → stay on the poster. No error state needed.
    videoARef.current?.play().catch(() => {});
  }, [reduced, stage, start]);

  // Only buffer Video B once Video A is actually playing — 1.83 MB deferred
  // past the opener instead of downloaded at page load.
  useEffect(() => {
    if (stage !== "videoA" || !videoBRef.current) return;
    videoBRef.current.preload = "auto";
    videoBRef.current.load();
  }, [stage]);

  const handleError = () => setStage("failed");

  const handleAEnded = () => {
    setStage("videoB");
    // B was buffered while A played (see the stage effect) and shares A's
    // final composition — the crossfade in CSS covers the handoff. Failure →
    // poster fallback.
    videoBRef.current?.play().catch(() => setStage("failed"));
  };

  return (
    <div className="hero__media" data-stage={stage} aria-hidden="true">
      <img
        className="hero__poster"
        src={HERO_POSTER_SRC}
        alt=""
        draggable={false}
        fetchPriority="high"
      />
      {!reduced && (
        <>
          <video
            ref={videoARef}
            className="hero__video hero__video-a"
            src={HERO_A_SRC}
            muted
            playsInline
            preload={start ? "auto" : "none"}
            disablePictureInPicture
            onPlaying={() => setStage("videoA")}
            onEnded={handleAEnded}
            onError={handleError}
          />
          <video
            ref={videoBRef}
            className="hero__video hero__video-b"
            src={HERO_B_SRC}
            muted
            playsInline
            loop
            preload="metadata"
            disablePictureInPicture
            onError={handleError}
          />
        </>
      )}
    </div>
  );
}
