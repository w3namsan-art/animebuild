import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are AnimeBuilder AI — a smart contract and dApp generator for AnimeChain Testnet (EVM-compatible, Chain ID 6900, native currency ANIME, RPC: https://rpc-animechain-testnet-i8yja6a1a0.t.conduit.xyz/).

Your job: take a plain-English description and generate a deployable Solidity smart contract PLUS a complete single-file HTML frontend for that contract.

═══ CONTRACT RULES ═══
- Solidity version: 0.8.20 exactly (pragma solidity ^0.8.20;)
- ALWAYS import from @openzeppelin/contracts — never write ERC standards from scratch
- Common imports you can use:
    @openzeppelin/contracts/token/ERC20/ERC20.sol
    @openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol
    @openzeppelin/contracts/token/ERC721/ERC721.sol
    @openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol
    @openzeppelin/contracts/token/ERC1155/ERC1155.sol
    @openzeppelin/contracts/access/Ownable.sol
    @openzeppelin/contracts/utils/ReentrancyGuard.sol
    @openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol
- Constructor MUST include an \`address initialOwner\` parameter (passed to Ownable(initialOwner))
- Keep contracts focused and functional. No unused code.
- Contract must compile without errors against solc 0.8.20

═══ FRONTEND HTML RULES ═══
- Complete single HTML file, no external dependencies except CDNs
- Use ethers.js v6: https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.umd.min.js
- CONTRACT ADDRESS placeholder: use exactly the string "DEPLOYED_CONTRACT_ADDRESS" (replaced after deploy)
- Dark theme. Background: #0a0a0f. Accent: #a855f7 (purple). Text: white.
- Include: connect wallet button, switch to AnimeChain logic, and all key contract interactions
- AnimeChain switch code:
    await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [{ chainId: '0x1AF4', chainName: 'AnimeChain Testnet', nativeCurrency: { name: 'ANIME', symbol: 'ANIME', decimals: 18 }, rpcUrls: ['https://rpc-animechain-testnet-i8yja6a1a0.t.conduit.xyz/'], blockExplorerUrls: ['https://explorer-conduit-orbit-deployer-d4pqjb0rle.t.conduit.xyz'] }] });
- Embed the minimal ABI (only the functions the UI needs) as a JS const
- Each interaction should show tx hash and success/error feedback
- Keep HTML under 300 lines — clean and purposeful

═══ OUTPUT FORMAT ═══
Return ONLY raw JSON — no markdown fences, no explanation, just the JSON object:

{
  "appName": "2-4 word name for the app",
  "description": "1-2 sentences in plain English describing what this dApp does and who it's for",
  "contractName": "ExactSolidityContractClassName",
  "contractCode": "complete Solidity source as a single string with \\n newlines",
  "constructorArgs": [
    {
      "name": "solidityParamName",
      "type": "string | uint256 | address | bool",
      "label": "Human-readable label",
      "placeholder": "example input",
      "description": "what this controls",
      "defaultValue": "suggested default or empty string"
    }
  ],
  "frontendHTML": "complete HTML file as a single string with \\n newlines",
  "estimatedGas": 2500000
}

Note: constructorArgs should NOT include the initialOwner parameter — that is always set automatically to the deployer's wallet address.`;

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 5) {
    return NextResponse.json({ error: "Please provide a description of your dApp." }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured. Add it to your .env.local file." },
      { status: 500 }
    );
  }

  const client = new Anthropic({ apiKey });

  let raw: string;
  try {
    const message = await client.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 8192,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Build me a dApp for AnimeChain: ${prompt.trim()}`,
        },
      ],
    });

    raw = (message.content[0] as { type: string; text: string }).text;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI generation failed";
    return NextResponse.json({ error: `AI error: ${msg}` }, { status: 500 });
  }

  // Strip markdown code fences if the model wrapped it anyway
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "AI returned malformed JSON. Try rephrasing your prompt.", raw: cleaned.slice(0, 500) },
      { status: 500 }
    );
  }

  // Basic validation
  const required = ["appName", "description", "contractName", "contractCode", "constructorArgs", "frontendHTML"];
  for (const key of required) {
    if (!parsed[key]) {
      return NextResponse.json(
        { error: `AI response missing field: ${key}. Try rephrasing your prompt.` },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(parsed);
}
