/**
 * Shared content types for the portfolio.
 *
 * Content lives in src/content/*.ts. UI components import types from here
 * so that changing copy never requires changing component design.
 */

export type ChapterId =
  | "arrival"
  | "path"
  | "craft"
  | "work"
  | "human"
  | "journey";

export interface Chapter {
  id: ChapterId;
  index: string;
  label: string;
  jp?: string;
  sectionRef: string;
  /**
   * Nav color theme for the chapter's artwork: "dark" artwork (charcoal)
   * uses warm-ivory chrome, "light" artwork (parchment) uses charcoal chrome.
   * Derived from the active-section state so brand + section name always
   * follow the current chapter.
   */
  theme: "light" | "dark";
  /** Artwork shown by the shared background compositor while this chapter is
      active. Absent for ARRIVAL — the hero media owns that chapter's visuals. */
  artwork?: string;
}

export interface Quote {
  /** One entry per deliberately composed line (rendered as a line break). */
  en: string[];
  ja: string[];
  romaji?: string;
  source?: string;
}

export interface HeroCopy {
  scrollCue: string;
}

export interface NavChrome {
  menu: string;
  close: string;
}

export interface ExperienceIntro {
  /** Editorial invitation line under the AADI brand. */
  quote: string;
  /** The explicit action label of the entry control. */
  enter: string;
}

export interface Profile {
  name: string;
  alias: string;
  monogram: string;
  /** Primary professional name mark shown at the top of the hero. */
  nameMark: string;
  /** Secondary creative/brand identity line under the professional name. */
  aliasMark: string;
  identity: string;
  oneLine: string;
  headline: string;
  title: string;
  heroQuote: Quote;
}

export interface JourneyStage {
  label: string;
  text: string;
}

export interface Milestone {
  title: string;
  period?: string;
  description: string;
  tags?: string[];
}

export interface Journey {
  /** Optional editorial intro above the stages (pending copy — not rendered). */
  intro?: string;
  stages: JourneyStage[];
  milestones: Milestone[];
}

export interface Skill {
  name: string;
  note?: string;
}

export interface CraftGroup {
  label: string;
  skills: Skill[];
}

export interface Craft {
  positioning: string;
  groups: CraftGroup[];
}

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  tech: string[];
  repositories: ProjectLink[];
  origin?: string;
  note?: string;
  image?: string;
  status?: string;
}

export interface Photo {
  /** Production asset path (public/assets/photography/production/). */
  src: string;
  /** Meaningful alt text — describes what is actually visible in the photo. */
  alt: string;
  /** Optional short editorial caption; only revealed on hover/focus. */
  caption?: string;
}

export interface Photography {
  description: string;
  note: string;
  images: Photo[];
}

export interface Human {
  intro: string;
  photography: Photography;
  interests: string[];
}

export interface FinalJourney {
  /** Closing line rendered as the cinematic-credits lead. */
  closing: string;
}

/** One suggested starter question rendered in the guide. */
export interface AiSuggestion {
  id: string;
  label: string;
}

/** User-facing messages for the guide's failure states. */
export interface AiDialogueErrorCopy {
  /** Malformed/unsupported request (4xx other than rate limit). */
  invalid: string;
  /** Too many requests from one client. */
  rateLimit: string;
  /** Upstream/provider or server failure (5xx). */
  general: string;
}

/** Editorial copy for the portfolio guide (content layer — not UI logic). */
export interface AiDialogue {
  /** Small crimson eyebrow above the guide, e.g. "Before you leave". */
  eyebrow: string;
  /** Serif invitation line under the eyebrow. */
  lead: string;
  /** Small supporting line under the lead. */
  note: string;
  /** The guide's opening message rendered as the first exchange. */
  initialMessage: string;
  /** Accessible label for the question input. */
  inputLabel: string;
  /** Placeholder shown in the question input. */
  inputPlaceholder: string;
  /** Submit button label. */
  submit: string;
  /** Heading label for the suggested-questions row. */
  suggestedLabel: string;
  /** Screen-reader status shown while the guide is answering. */
  loadingLabel: string;
  /** Accessible name for the conversation log region. */
  threadLabel: string;
  /** Small set of starter questions. */
  suggestions: AiSuggestion[];
  /** Failure copy mapped by the client. */
  errors: AiDialogueErrorCopy;
}

export type SocialId = "email" | "github" | "x" | "linkedin";

export interface Social {
  id: SocialId;
  label: string;
  url: string;
  handle?: string;
}
