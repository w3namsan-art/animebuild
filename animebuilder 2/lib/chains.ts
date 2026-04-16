import { defineChain } from "viem";

export const animeChainTestnet = defineChain({
  id: 6900,
  name: "AnimeChain Testnet",
  nativeCurrency: {
    name: "ANIME",
    symbol: "ANIME",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc-animechain-testnet-i8yja6a1a0.t.conduit.xyz/"],
    },
  },
  blockExplorers: {
    default: {
      name: "AnimeChain Explorer",
      url: "https://explorer-conduit-orbit-deployer-d4pqjb0rle.t.conduit.xyz",
    },
  },
  testnet: true,
});
