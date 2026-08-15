/**
 * Authoritative portfolio knowledge for the AI guide (v1 — static, no RAG).
 *
 * This is the ONLY file that knows Aadi's story. It is grounded 1:1 in the
 * live portfolio content (src/content/profile.ts, craft.ts, projects.ts,
 * journey.ts, socials.ts) and the approved project docs. Changing the
 * portfolio's facts means editing THIS file — never the API implementation
 * (api/prompt.ts, api/chat.ts stay untouched).
 *
 * Deliberately kept small and prompt-shaped: no vectors, no database, no
 * tools, no browsing. The model receives exactly this text as part of its
 * system message.
 */
export const PORTFOLIO_CONTEXT = `
PROFILE — Aadi (Devarshi Dave)

IDENTITY
Devarshi Dave, known as Aadi (brand mark: AADI; hero presents "DEVARSHI" with
the alias "A.K.A. AADI"). A Computer Science student and self-taught engineer
working across blockchain and AI. His positioning line: "AI × WEB3 × SYSTEMS".
He describes his approach as building first and formalizing later — "from
Solidity to autonomous agents, building systems that don't need me in the
loop." He builds smart contract systems and autonomous AI agents.

SKILLS — TECHNICAL STACK
Core: Solidity (smart contract development), Foundry (testing, invariant &
fuzz), Ethers.js (chain interaction), Python (backend & agents), FastAPI
(API layer), React / Vite / TypeScript (frontend), SQLite (local data).
Technologies he reaches for: Chainlink (price feeds), OpenRouter and Groq
(LLM orchestration), Ollama (local models), Server-Sent Events streaming
(live agent output), on-chain attestation on Base Sepolia.

PROJECTS
1. Loupe — an autonomous smart contract audit agent. Fully autonomous, using
   dual-phase analysis: a standard audit plus adversarial simulation. Built
   with FastAPI, React / Vite / TypeScript, OpenRouter / Groq, SSE streaming,
   Base Sepolia attestation, and Foundry exploit tests. A team project from
   ETHGlobal OpenAgents 2026, built largely solo.
2. Alfred — a Batman-themed, locally-running agentic desktop assistant with
   voice interaction and autonomous web navigation. Built with Python /
   FastAPI, Tauri, Ollama / Groq, faster-whisper, Kokoro TTS, and SQLite.
3. DeFi Stablecoin — a MakerDAO-inspired decentralized stablecoin backed by
   WETH and WBTC collateral with a liquidation engine. Built with Solidity,
   Foundry, and Chainlink price feeds; heavily tested via invariant and fuzz
   testing.
4. Blockchain Voting System — a factory-pattern decentralized voting platform
   that deploys one election contract per election. It has TWO repositories:
   the smart contracts (Foundry) and the React / Ethers.js frontend deployed
   on Vercel.

EXPERIENCE — BUILDING HISTORY
Self-taught Web3: began with Cyfrin Updraft, building foundations in
Solidity, Foundry, and Ethers.js, then going deeper into DeFi protocol
design. In AI he started building autonomous agents hands-on before
formalizing the underlying engineering. Milestones: ETHGlobal OpenAgents 2026
(where Loupe was built), Loupe, and Alfred.

EDUCATION
B.E. Computer Science & Engineering at SAL Engineering & Technical Institute
(GTU), class of 2027.

CURRENT STATUS
Grounded in the portfolio's AI journey stage ("started building autonomous
agents hands-on before formalizing the underlying engineering, now on a
structured path to build that foundation properly") and its latest work:
Aadi is currently working on autonomous AI agents and smart contract systems.
His newest agentic work is Loupe (autonomous smart-contract audit agent, ETHGlobal
OpenAgents 2026) and Alfred (a locally-running agentic desktop assistant), while
he formalizes a structured foundation in AI engineering and continues deeper
Web3 / DeFi work. Answer current-status questions ONLY from this paragraph —
never infer status from project ordering.

TECHNICAL INTERESTS
Smart contract audit and security (invariant & fuzz testing), DeFi protocol
design, autonomous AI agents, LLM orchestration (OpenRouter / Groq), local
models (Ollama), SSE streaming for live agent output, and on-chain
attestation.

AVAILABILITY
The portfolio does not publicly document current availability or engagement
terms for internships or roles, so the assistant must not state that he is or
is not open to specific opportunities. Aadi is a final-year Computer Science
student (class of 2027). For accurate, current answers about opportunities,
availability, or collaboration, direct the visitor to contact him directly.

CONTACT / OPPORTUNITIES
Public portfolio links (safe to share): email devarshidave007@gmail.com ·
GitHub https://github.com/Heisen111 · X https://x.com/zen_aadi ·
LinkedIn https://www.linkedin.com/in/devarshi-dave-76b474395
`.trim();