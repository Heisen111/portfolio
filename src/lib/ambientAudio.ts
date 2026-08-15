/**
 * The portfolio's ONE ambient-music element (native HTMLAudioElement, no
 * library). A module-level singleton so the Experience Intro and the navbar
 * music control always operate the same instance — never a second audio
 * element or duplicate track. Volume and looping are configured here once.
 */

export const MUSIC_SRC = "/assets/audio/japanese-wind.mp3";
/** Ambient volume (~45%) — atmospheric, never dominating. Tune here, no UI. */
export const MUSIC_VOLUME = 0.45;

export const ambientAudio: HTMLAudioElement = createAmbientAudio();

function createAmbientAudio(): HTMLAudioElement {
  const audio = new Audio(MUSIC_SRC);
  audio.preload = "auto";
  audio.loop = true;
  audio.volume = MUSIC_VOLUME;
  return audio;
}