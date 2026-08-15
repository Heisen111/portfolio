import type { AiDialogue } from "../types";

/**
 * THE NEXT JOURNEY — portfolio guide copy. The AI concierge is an editorial
 * end-of-credits conversation, not a chat widget. All copy lives here and is
 * typed by `AiDialogue`; the component only renders it.
 */
export const aiDialogue: AiDialogue = {
  eyebrow: "Before you leave",
  lead: "The film ends here — but if any part of it made you curious, ask.",
  note: "A small guide to the work. It answers only from the portfolio.",
  initialMessage:
    "This is where the credits roll. If anything along the way left you curious — the projects, the tools, the direction — I can speak to it.",
  inputLabel: "Ask about Aadi and his portfolio",
  inputPlaceholder: "Ask about the work…",
  submit: "Ask",
  suggestedLabel: "You could ask",
  loadingLabel: "The guide is answering…",
  threadLabel: "Conversation with the portfolio guide",
  suggestions: [
    { id: "loupe", label: "What is Loupe?" },
    { id: "building-now", label: "What is Aadi building now?" },
    { id: "stack", label: "What is his technical stack?" },
    { id: "opportunities", label: "Is he open to opportunities?" },
  ],
  errors: {
    invalid: "That question didn't come through — please try again.",
    rateLimit: "Please wait a moment before asking another question.",
    general:
      "Something went wrong while reaching the portfolio assistant. Please try again.",
  },
};