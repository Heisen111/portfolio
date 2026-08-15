import { useEffect, useState } from "react";
import { ambientAudio } from "../../lib/ambientAudio";

/**
 * Compact play/pause control for the cinematic ambient music. Wraps the ONE
 * shared `ambientAudio` instance (src/lib/ambientAudio.ts) — the same element
 * the Experience Intro starts on ENTER, so there is never a second audio
 * element. Volume + looping are configured once on the shared instance. The
 * icon tracks the REAL audio state via the element's play/pause events, never
 * guessed state.
 */
export default function MusicControl() {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    ambientAudio.addEventListener("play", onPlay);
    ambientAudio.addEventListener("pause", onPause);
    return () => {
      ambientAudio.removeEventListener("play", onPlay);
      ambientAudio.removeEventListener("pause", onPause);
    };
  }, []);

  const toggle = () => {
    if (ambientAudio.paused) {
      ambientAudio.play().catch(() => {
        /* Nothing to surface — the control stays paused. */
      });
    } else {
      ambientAudio.pause();
    }
  };

  return (
    <button
      type="button"
      className={`nav__music${playing ? " nav__music--playing" : ""}`}
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "Pause ambient music" : "Play ambient music"}
    >
      {playing ? <PauseIcon /> : <PlayIcon />}
    </button>
  );
}

function PlayIcon() {
  return (
    <svg
      className="nav__music-icon"
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4.5 2.9v10.2c0 .5.6.8 1 .6l8.6-5.1a.8.8 0 0 0 0-1.4L5.5 2.3a.7.7 0 0 0-1 .6Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      className="nav__music-icon"
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 2.5h2.8v11H4zM9.2 2.5H12v11H9.2z" />
    </svg>
  );
}