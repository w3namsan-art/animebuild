# AnimeBuilder

**AI-powered dApp builder for AnimeChain Testnet.**

Describe your dApp in plain English → AI generates the Solidity contract and a complete frontend HTML file → deploy directly from your wallet.

Inspired by [iBuild by Injective](https://injective.com/blog/injective-releases-i-build-the-new-standard-for-ai-powered-onchain-development), built natively for AnimeChain.

---

## How it works

1. **Type a prompt** — "Create a token called Anime Gold with 1 million supply"
2. **AI generates** — a complete Solidity smart contract + single-file HTML frontend wired to that contract
3. **You configure** — fill in any constructor parameters (pre-filled with AI suggestions)
4. **Deploy** — sign one transaction from your wallet; contract is live on AnimeChain
5. **Download** — grab your generated frontend HTML; open in any browser and your dApp works

---

## Setup

### Step 1: Get an Anthropic API key
Go to [console.anthropic.com](https://console.anthropic.com), create a free account, and generate an API key.

### Step 2: Get a WalletConnect Project ID
Go to [cloud.walletconnect.com](https://cloud.walletconnect.com), create a free project, copy the Project ID.

### Step 3: Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in both values:
```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=abc123...
```

### Step 4: Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

### Recommended: Vercel Dashboard

1. Push this folder to a GitHub repo
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. In the Environment Variables section, add:
   - `ANTHROPIC_API_KEY` → your key from console.anthropic.com
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` → your ID from cloud.walletconnect.com
4. Click **Deploy**

### Vercel CLI

```bash
npm i -g vercel
vercel
# follow the prompts, add env vars when asked
```

---

## AnimeChain Testnet

| | |
|---|---|
| Chain ID | 6900 |
| Currency | ANIME |
| RPC URL | https://rpc-animechain-testnet-i8yja6a1a0.t.conduit.xyz/ |
| Block Explorer | https://explorer-conduit-orbit-deployer-d4pqjb0rle.t.conduit.xyz |

**Add to MetaMask:** Settings → Networks → Add Network → fill in the values above.

---

## Tech Stack

- **Next.js 16** (App Router, Node.js API routes)
- **Claude claude-3-5-haiku-20241022** via Anthropic SDK — AI contract + frontend generation
- **solc 0.8.26** — server-side Solidity compilation
- **OpenZeppelin Contracts 5** — contract base libraries
- **wagmi v2 + viem** — wallet interaction and contract deployment
- **RainbowKit v2** — wallet connection UI
- **Tailwind CSS v4** — styling
