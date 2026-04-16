"use client";

import { useState, useRef, useEffect } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { encodeDeployData } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ConstructorForm } from "@/components/ConstructorForm";
import { ContractCodeViewer } from "@/components/ContractCodeViewer";
import { DeployResult } from "@/components/DeployResult";
import { GeneratedApp, CompiledContract, BuildStep, ConstructorArg } from "@/lib/types";

const EXAMPLES = [
  "Create a token called Anime Gold with symbol AGLD, 1 million supply, mintable by owner",
  "NFT collection for anime artwork, max 5000 pieces, mint price 2 ANIME",
  "Staking pool where users stake ANIME tokens and earn rewards over 30 days",
  "DAO voting system for my anime community with proposals and time-limited votes",
  "Token airdrop contract — owner loads it with tokens and users can claim their share",
  "Presale contract — users send ANIME and receive project tokens at a fixed rate",
];

function coerceArg(value: string, type: ConstructorArg["type"]): unknown {
  if (type === "uint256") return BigInt(value || "0");
  if (type === "bool") return value === "true";
  return value;
}

export default function Home() {
  const { isConnected, address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [step, setStep] = useState<BuildStep>("prompt");
  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState<GeneratedApp | null>(null);
  const [compiled, setCompiled] = useState<CompiledContract | null>(null);
  const [argValues, setArgValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [deployResult, setDeployResult] = useState<{ address: string; txHash: string } | null>(null);
  const reviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step === "review" && reviewRef.current) {
      setTimeout(() => reviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [step]);

  function setArg(name: string, value: string) {
    setArgValues((v) => ({ ...v, [name]: value }));
  }

  async function generate() {
    if (!prompt.trim()) return;
    setStep("generating");
    setError("");
    setGenerated(null);
    setCompiled(null);
    setDeployResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      // Pre-fill default values
      const defaults: Record<string, string> = {};
      (data.constructorArgs as ConstructorArg[]).forEach((a) => {
        defaults[a.name] = a.defaultValue ?? "";
      });
      setArgValues(defaults);
      setGenerated(data as GeneratedApp);
      setStep("review");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
      setStep("prompt");
    }
  }

  async function compileAndDeploy() {
    if (!generated || !walletClient || !publicClient || !address) return;
    setStep("compiling");
    setError("");

    // Step 1: Compile
    let contractData: CompiledContract;
    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: generated.contractCode, contractName: generated.contractName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Compilation failed");
      contractData = data as CompiledContract;
      setCompiled(contractData);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Compilation failed");
      setStep("review");
      return;
    }

    // Step 2: Deploy
    setStep("deploying");
    try {
      // Build constructor args — always append owner address last
      const args: unknown[] = generated.constructorArgs.map((a) =>
        coerceArg(argValues[a.name] ?? a.defaultValue ?? "", a.type)
      );
      args.push(address); // initialOwner

      const deployData = encodeDeployData({
        abi: contractData.abi,
        bytecode: contractData.bytecode,
        args,
      });

      const hash = await walletClient.sendTransaction({
        data: deployData,
        gas: BigInt(generated.estimatedGas || 3_000_000),
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (!receipt.contractAddress) throw new Error("No contract address in receipt");

      setDeployResult({ address: receipt.contractAddress, txHash: hash });
      setStep("success");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Deployment failed");
      setStep("review");
    }
  }

  function reset() {
    setStep("prompt");
    setPrompt("");
    setGenerated(null);
    setCompiled(null);
    setDeployResult(null);
    setError("");
    setArgValues({});
  }

  const isGenerating = step === "generating";
  const isCompiling = step === "compiling";
  const isDeploying = step === "deploying";
  const isBusy = isGenerating || isCompiling || isDeploying;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      {/* ── HERO ── */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 leading-tight">
          Build anything on
          <br />
          <span className="gradient-text">AnimeChain</span>
        </h1>
        <p className="text-lg text-white/50">
          Describe your dApp in plain English. We generate the smart contract and frontend — you just deploy.
        </p>
      </div>

      {/* ── PROMPT BOX ── */}
      <div className="card-glow rounded-2xl p-6 mb-4">
        <textarea
          className="anime-input resize-none text-base leading-relaxed"
          style={{ minHeight: 120 }}
          placeholder={"Describe what you want to build\u2026 e.g. \u201cCreate a token called Anime Gold with 1 million supply\u201d"}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !isBusy) generate();
          }}
          disabled={isBusy}
        />

        <div className="flex items-center justify-between mt-4 gap-3">
          <p className="text-xs text-white/30 hidden sm:block">⌘ + Enter to generate</p>
          <button
            className="btn-primary"
            style={{ width: "auto", minWidth: 160, padding: "11px 24px" }}
            onClick={generate}
            disabled={!prompt.trim() || isBusy}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="animate-spin">⟳</span> Generating…
              </span>
            ) : (
              "✦ Generate dApp"
            )}
          </button>
        </div>
      </div>

      {/* ── ERROR ── */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-4 mb-6">
          <p className="font-medium mb-1">Something went wrong</p>
          <p className="text-white/50">{error}</p>
        </div>
      )}

      {/* ── EXAMPLE PROMPTS ── */}
      {step === "prompt" && (
        <div className="mt-6">
          <p className="text-xs text-white/30 mb-3 uppercase tracking-widest">Examples</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setPrompt(ex)}
                className="text-xs px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-purple-500/40 transition-colors text-left"
              >
                {ex.length > 60 ? ex.slice(0, 57) + "…" : ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── GENERATING LOADING STATE ── */}
      {isGenerating && (
        <div className="mt-8 card-glow rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4 animate-bounce">✦</div>
          <p className="font-semibold text-white mb-2">Generating your dApp…</p>
          <p className="text-sm text-white/40">
            Writing your smart contract and frontend. This takes about 10–20 seconds.
          </p>
        </div>
      )}

      {/* ── REVIEW & DEPLOY ── */}
      {generated && (step === "review" || step === "compiling" || step === "deploying" || step === "success") && (
        <div ref={reviewRef} className="mt-10 space-y-6">
          {/* App summary */}
          <div className="card-glow rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{generated.appName}</h2>
                <p className="text-white/50 mt-1">{generated.description}</p>
              </div>
              {step !== "success" && (
                <button onClick={reset} className="btn-secondary text-xs px-3 py-1.5 shrink-0">
                  ← Start over
                </button>
              )}
            </div>

            {/* Contract code viewer */}
            <ContractCodeViewer
              code={generated.contractCode}
              contractName={generated.contractName}
            />
          </div>

          {/* Success state */}
          {step === "success" && deployResult && (
            <DeployResult
              contractAddress={deployResult.address}
              txHash={deployResult.txHash}
              appName={generated.appName}
              frontendHTML={generated.frontendHTML}
            />
          )}

          {/* Configure & deploy */}
          {step !== "success" && (
            <div className="card-glow rounded-2xl p-6 space-y-5">
              <div>
                <h3 className="font-semibold text-white mb-1">Configure & Deploy</h3>
                <p className="text-sm text-white/40">
                  Review the parameters below, then deploy to AnimeChain Testnet.
                </p>
              </div>

              <ConstructorForm
                args={generated.constructorArgs}
                values={argValues}
                onChange={setArg}
              />

              {/* Compile error */}
              {error && step === "review" && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                  <p className="font-medium mb-1">Compilation error</p>
                  <pre className="text-xs text-white/40 whitespace-pre-wrap font-mono">{error}</pre>
                  <p className="text-white/40 text-xs mt-2">
                    Try a slightly different prompt and regenerate.
                  </p>
                </div>
              )}

              {/* Status messages */}
              {isCompiling && (
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm flex items-center gap-3">
                  <span className="animate-spin">⟳</span> Compiling contract…
                </div>
              )}
              {isDeploying && (
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-sm flex items-center gap-3">
                  <span className="animate-spin">⟳</span> Confirm the transaction in your wallet…
                </div>
              )}

              {/* Connect wallet or deploy */}
              {!isConnected ? (
                <div className="flex flex-col items-center gap-3 py-2">
                  <p className="text-sm text-white/40">Connect your wallet to deploy</p>
                  <ConnectButton />
                </div>
              ) : (
                <button
                  className="btn-primary"
                  onClick={compileAndDeploy}
                  disabled={isBusy}
                >
                  {isCompiling
                    ? "Compiling…"
                    : isDeploying
                    ? "Waiting for wallet…"
                    : "🚀 Deploy to AnimeChain"}
                </button>
              )}

              <p className="text-xs text-white/25 text-center">
                Deploying as <span className="font-mono">{address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "—"}</span> · You will be set as contract owner
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── HOW IT WORKS (only on idle) ── */}
      {step === "prompt" && (
        <div className="mt-20">
          <h2 className="text-xl font-semibold text-white/60 text-center mb-8">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { n: "1", icon: "✍️", title: "Describe it", body: "Type what you want in plain English — a token, NFT, staking pool, DAO, or anything else." },
              { n: "2", icon: "⚙️", title: "We build it", body: "AI generates a complete Solidity contract and a ready-to-use frontend HTML file." },
              { n: "3", icon: "🚀", title: "You deploy it", body: "Review, configure, and deploy directly from your wallet. Download your frontend and you're live." },
            ].map((s) => (
              <div key={s.n} className="card-glow rounded-2xl p-5 text-center">
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-white/40">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
