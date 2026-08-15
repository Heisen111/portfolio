import type { Craft } from "../types";

export const craft: Craft = {
  positioning: "Aadi builds smart contract systems and autonomous AI agents.",
  groups: [
    {
      label: "Core",
      skills: [
        { name: "Solidity", note: "Smart contract development" },
        { name: "Foundry", note: "Testing, invariant & fuzz" },
        { name: "Ethers.js", note: "Chain interaction" },
        { name: "Python", note: "Backend & agents" },
        { name: "FastAPI", note: "API layer" },
        { name: "React / Vite / TypeScript", note: "Frontend" },
        { name: "SQLite", note: "Local data" },
      ],
    },
    {
      label: "Technologies",
      skills: [
        { name: "Chainlink", note: "Price feeds" },
        { name: "OpenRouter / Groq", note: "LLM orchestration" },
        { name: "Ollama", note: "Local models" },
        { name: "SSE streaming", note: "Live agent output" },
        { name: "On-chain attestation", note: "Base Sepolia" },
      ],
    },
  ],
};
