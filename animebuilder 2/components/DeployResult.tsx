"use client";

const EXPLORER = "https://explorer-conduit-orbit-deployer-d4pqjb0rle.t.conduit.xyz";

function shorten(s: string) {
  return `${s.slice(0, 6)}...${s.slice(-4)}`;
}

interface Props {
  contractAddress: string;
  txHash: string;
  appName: string;
  frontendHTML: string;
}

export function DeployResult({ contractAddress, txHash, appName, frontendHTML }: Props) {
  // Inject the real contract address into the generated frontend HTML
  const finalHTML = frontendHTML.replace(/DEPLOYED_CONTRACT_ADDRESS/g, contractAddress);

  function downloadFrontend() {
    const blob = new Blob([finalHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${appName.toLowerCase().replace(/\s+/g, "-")}-frontend.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Success banner */}
      <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-5 flex items-start gap-4">
        <div className="w-10 h-10 shrink-0 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xl">
          ✓
        </div>
        <div>
          <p className="font-semibold text-green-300 text-lg">Your dApp is live!</p>
          <p className="text-sm text-white/40 mt-0.5">
            {appName} is deployed on AnimeChain Testnet
          </p>
        </div>
      </div>

      {/* Contract address */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <p className="text-xs text-white/40 mb-1">Contract Address</p>
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-sm text-purple-300 break-all">{contractAddress}</p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => navigator.clipboard.writeText(contractAddress)}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              Copy
            </button>
            <a
              href={`${EXPLORER}/address/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs px-3 py-1.5"
            >
              Explorer ↗
            </a>
          </div>
        </div>
      </div>

      {/* Tx hash */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <p className="text-xs text-white/40 mb-1">Transaction</p>
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-sm text-white/60">{shorten(txHash)}</p>
          <a
            href={`${EXPLORER}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs px-3 py-1.5 shrink-0"
          >
            View Tx ↗
          </a>
        </div>
      </div>

      {/* Download frontend */}
      <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-5">
        <div className="flex items-start gap-4">
          <span className="text-3xl">🖥️</span>
          <div className="flex-1">
            <p className="font-semibold text-white mb-1">Your frontend is ready</p>
            <p className="text-sm text-white/40 mb-4">
              A complete HTML file wired to your contract — open it in any browser, connect MetaMask, and your dApp works immediately.
            </p>
            <button onClick={downloadFrontend} className="btn-primary" style={{ width: "auto", padding: "10px 20px" }}>
              ⬇ Download Frontend HTML
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs text-white/25 text-center pt-2">
        Want to build another? Scroll back up and enter a new prompt.
      </p>
    </div>
  );
}
