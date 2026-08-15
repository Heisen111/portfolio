import type { Project } from "../types";

export const projects: Project[] = [
  {
    id: "loupe",
    title: "Loupe",
    tagline: "Autonomous Smart Contract Audit Agent",
    description:
      "Fully autonomous audit agent using dual-phase analysis: standard audit plus adversarial simulation.",
    tech: [
      "FastAPI",
      "React / Vite / TypeScript",
      "OpenRouter / Groq",
      "SSE streaming",
      "Base Sepolia attestation",
      "Foundry exploit tests",
    ],
    repositories: [{ label: "GitHub", url: "https://github.com/Heisen111/Loupe" }],
    origin: "ETHGlobal OpenAgents 2026 team project, built largely solo.",
  },
  {
    id: "alfred",
    title: "Alfred",
    tagline: "Batman-Themed Agentic Desktop Assistant",
    description:
      "Locally-running desktop assistant with voice interaction and autonomous web navigation.",
    tech: [
      "Python / FastAPI",
      "Tauri",
      "Ollama / Groq",
      "faster-whisper",
      "Kokoro TTS",
      "SQLite",
    ],
    repositories: [
      { label: "GitHub", url: "https://github.com/Heisen111/alfred" },
    ],
  },
  {
    id: "defi-stablecoin",
    title: "DeFi Stablecoin",
    tagline: "WETH/WBTC-backed decentralized stablecoin",
    description:
      "MakerDAO-inspired decentralized stablecoin backed by WETH/WBTC collateral with a liquidation engine.",
    tech: ["Solidity", "Foundry", "Chainlink Price Feeds"],
    repositories: [
      {
        label: "GitHub",
        url: "https://github.com/Heisen111/foundry-defi-stablecoin",
      },
    ],
    note: "Invariant and fuzz testing were used.",
  },
  {
    id: "blockchain-voting",
    title: "Blockchain Voting System",
    tagline: "Factory-pattern decentralized voting",
    description:
      "Decentralized voting platform using a factory pattern to deploy individual election contracts.",
    tech: [
      "Solidity",
      "VotingFactory pattern",
      "Sepolia",
      "React",
      "Ethers.js",
      "Vercel",
    ],
    repositories: [
      {
        label: "Smart contracts (Foundry)",
        url: "https://github.com/Heisen111/Foundry-blockchain-voting-system",
      },
      {
        label: "Frontend",
        url: "https://github.com/Heisen111/bvsV2",
      },
    ],
    note: "Two repositories: smart contracts and frontend.",
  },
];