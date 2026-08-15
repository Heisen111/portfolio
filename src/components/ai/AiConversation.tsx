import { useEffect, useRef, useState, type FormEvent } from "react";
import { aiDialogue } from "../../content/ai";
import { askPortfolioQuestion } from "../../lib/chat";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface Exchange {
  id: number;
  /** null for the opening greeting exchange. */
  question: string | null;
  answer: string | null;
  error: string | null;
}

let nextExchangeId = 1;

/**
 * The portfolio guide — an editorial Q&A at the end of THE NEXT JOURNEY, not
 * a chat widget. A question + answer is ONE exchange rendered as typography:
 * the question in the display serif, the answer in body text, nothing else.
 *
 * Accessibility: the thread is a `role="log"` polite live region; the form is
 * a real <form> (Enter submits, focus stays in the input); suggestions are
 * real buttons; while a question is pending the input+submit are disabled and
 * a visually-hidden status announces the loading label. Answers are rendered
 * as plain text only (never HTML). Reduced motion: reveals/dots collapse via
 * base.css; the section keeps working.
 *
 * No conversation memory beyond this tab session — each question is sent alone
 * with the system prompt+context; nothing is persisted anywhere.
 */
export default function AiConversation() {
  const reduced = useReducedMotion();
  const [exchanges, setExchanges] = useState<Exchange[]>([
    {
      id: 0,
      question: null,
      answer: aiDialogue.initialMessage,
      error: null,
    },
  ]);
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);

  const ask = async (raw: string) => {
    const text = raw.trim();
    if (text.length === 0 || pending) return;

    setPending(true);
    const id = nextExchangeId++;
    setExchanges((list) => [
      ...list,
      { id, question: text, answer: null, error: null },
    ]);
    setQuestion("");

    const result = await askPortfolioQuestion(text);

    setPending(false);
    setExchanges((list) =>
      list.map((item) => {
        if (item.id !== id) return item;
        if (result.ok) return { ...item, answer: result.answer };
        const message =
          result.code === "rate_limit"
            ? aiDialogue.errors.rateLimit
            : result.code === "invalid"
              ? aiDialogue.errors.invalid
              : aiDialogue.errors.general;
        return { ...item, error: message };
      }),
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void ask(question);
  };

  const handleSuggestion = (label: string) => {
    setQuestion(label);
    void ask(label);
  };

  // Keep the newest exchange in view once an answer lands.
  useEffect(() => {
    if (pending) return;
    inputRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "nearest",
    });
  }, [pending, reduced, exchanges.length]);

  return (
    <section className="guide" aria-labelledby="guide-eyebrow">
      <header className="guide__head">
        <p id="guide-eyebrow" className="guide__eyebrow">
          {aiDialogue.eyebrow}
        </p>
        <p className="guide__lead">{aiDialogue.lead}</p>
        <p className="guide__note">{aiDialogue.note}</p>
      </header>

      <div
        ref={threadRef}
        className="guide__thread"
        role="log"
        aria-label={aiDialogue.threadLabel}
        aria-live="polite"
        aria-busy={pending}
      >
        {exchanges.map((exchange) => (
          <article className="guide__exchange" key={exchange.id}>
            {exchange.question !== null && (
              <p className="guide__question">{exchange.question}</p>
            )}
            {exchange.answer !== null ? (
              <p className="guide__answer">{exchange.answer}</p>
            ) : exchange.error !== null ? (
              <p className="guide__error" role="status">
                {exchange.error}
              </p>
            ) : (
              <p className="guide__pending" aria-hidden="true">
                <span className="guide__dot" />
                <span className="guide__dot" />
                <span className="guide__dot" />
              </p>
            )}
          </article>
        ))}
      </div>

      <p className="guide-sr-only" role="status" aria-live="polite">
        {pending ? aiDialogue.loadingLabel : ""}
      </p>

      <p className="guide__suggested-label">{aiDialogue.suggestedLabel}</p>
      <ul className="guide__suggestions">
        {aiDialogue.suggestions.map((suggestion) => (
          <li key={suggestion.id}>
            <button
              type="button"
              className="guide__suggestion"
              onClick={() => handleSuggestion(suggestion.label)}
              disabled={pending}
            >
              {suggestion.label}
            </button>
          </li>
        ))}
      </ul>

      <form className="guide__form" onSubmit={handleSubmit}>
        <label className="guide-sr-only" htmlFor="guide-question">
          {aiDialogue.inputLabel}
        </label>
        <div className="guide__field">
          <input
            ref={inputRef}
            id="guide-question"
            className="guide__input"
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={aiDialogue.inputPlaceholder}
            autoComplete="off"
            maxLength={1000}
            disabled={pending}
          />
          <button className="guide__submit" type="submit" disabled={pending}>
            {aiDialogue.submit}
          </button>
        </div>
      </form>
    </section>
  );
}