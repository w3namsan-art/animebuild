import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { animeChainTestnet } from "./chains";

export const wagmiConfig = getDefaultConfig({
  appName: "AnimeBuilder",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_WALLETCONNECT_PROJECT_ID",
  chains: [animeChainTestnet],
  ssr: true,
});
