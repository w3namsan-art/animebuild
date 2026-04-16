"use client";

import { useState } from "react";

interface Props {
  code: string;
  contractName: string;
}

export function ContractCodeViewer({ code, contractName }: Props) {
  const [expanded, setExpanded] = useState(false);
  const lines = code.split("\n");

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/8 transition-colors text-sm"
      >
        <div className="flex items-center gap-2">
          <span className="text-white/40">📄</span>
          <span className="font-mono text-purple-300">{contractName}.sol</span>
          <span className="text-white/30">· {lines.length} lines</span>
        </div>
        <span className="text-white/40 text-xs">{expanded ? "▲ hide" : "▼ view code"}</span>
      </button>

      {expanded && (
        <div className="relative">
          <pre className="overflow-x-auto text-xs font-mono bg-[#0d0d14] text-white/70 p-4 max-h-80 overflow-y-auto leading-relaxed">
            <code>{code}</code>
          </pre>
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            className="absolute top-2 right-2 btn-secondary text-xs px-2 py-1"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
}
