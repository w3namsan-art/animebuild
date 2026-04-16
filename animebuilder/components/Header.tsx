"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-purple-500/20">
            A
          </div>
          <span className="font-bold text-lg tracking-tight">
            Anime<span className="gradient-text">Builder</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <span className="hidden md:flex items-center gap-1.5 text-xs text-white/40 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            AnimeChain Testnet
          </span>
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
        </div>
      </div>
    </header>
  );
}
