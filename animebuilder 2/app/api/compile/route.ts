import { NextRequest, NextResponse } from "next/server";
import { createRequire } from "module";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";
export const maxDuration = 30;

const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const solc = require("solc");

function findImports(importPath: string) {
  const libPath = path.join(process.cwd(), "node_modules", importPath);
  try {
    return { contents: fs.readFileSync(libPath, "utf8") };
  } catch {
    return { error: `File not found: ${importPath}` };
  }
}

export async function POST(req: NextRequest) {
  const { source, contractName } = await req.json();

  if (!source || !contractName) {
    return NextResponse.json({ error: "source and contractName are required" }, { status: 400 });
  }

  const input = {
    language: "Solidity",
    sources: { "Contract.sol": { content: source } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
    },
  };

  let output: {
    errors?: { severity: string; formattedMessage: string }[];
    contracts?: Record<string, Record<string, { abi: unknown[]; evm: { bytecode: { object: string } } }>>;
  };

  try {
    output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
  } catch (err: unknown) {
    return NextResponse.json(
      { error: `Compiler crashed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }

  // Collect errors
  const errors = (output.errors ?? []).filter((e) => e.severity === "error");
  if (errors.length > 0) {
    const msg = errors
      .map((e) => e.formattedMessage)
      .join("\n")
      .split("\n")
      .slice(0, 8)
      .join("\n");
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  const fileContracts = output.contracts?.["Contract.sol"];
  if (!fileContracts) {
    return NextResponse.json({ error: "No contracts found after compilation." }, { status: 422 });
  }

  // Try exact name first, then fall back to first contract
  const contract = fileContracts[contractName] ?? Object.values(fileContracts)[0];
  if (!contract) {
    return NextResponse.json({ error: "Contract not found in compilation output." }, { status: 422 });
  }

  return NextResponse.json({
    abi: contract.abi,
    bytecode: "0x" + contract.evm.bytecode.object,
  });
}
