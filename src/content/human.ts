import type { Human } from "../types";

export const human: Human = {
  // Personal/creative statement. Draft — reword freely; keep it short and
  // understated. Mention music + cinema naturally as interests, not as
  // portfolio categories.
  intro:
    "My days are spent in systems — contracts, agents, terminals. Outside them I'd rather notice the world: the way light moves, a face in a crowd, a line of a song that won't leave. That noticing is half the craft.",
  photography: {
    description: "Nature and street photography.",
    note: "Photography is personal rather than a professional photography business.",
    // TODO: the alt text below is inferred from the file names only — I cannot
    // see the photos. Replace each with a sentence describing what is actually
    // visible (subject, setting, light, whatever matters in the frame).
    images: [
      {
        src: "/assets/photography/production/flower.webp",
        alt: "A photograph of a plant or leaves",
      },
      {
        src: "/assets/photography/production/cat.webp",
        alt: "A photograph of a cat",
      },
      {
        src: "/assets/photography/production/windows.webp",
        alt: "A photograph of windows",
      },
    ],
  },
  interests: ["Photography", "Music", "Cinema"],
};