import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "AnimeBuilder – Deploy Smart Contracts on AnimeChain",
  description:
    "No-code smart contract deployment tool for AnimeChain. Deploy ERC-20 tokens, NFT collections, staking pools, and DAOs in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-white font-sans">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/10 py-6 text-center text-sm text-white/40">
            © {new Date().getFullYear()} AnimeBuilder — Built for AnimeChain Testnet
          </footer>
        </Providers>
      </body>
    </html>
  );
}
