export interface ConstructorArg {
  name: string;
  type: "string" | "uint256" | "address" | "bool";
  label: string;
  placeholder: string;
  description: string;
  defaultValue: string;
}

export interface GeneratedApp {
  appName: string;
  description: string;
  contractName: string;
  contractCode: string;
  constructorArgs: ConstructorArg[];
  frontendHTML: string;
  estimatedGas: number;
}

export interface CompiledContract {
  abi: unknown[];
  bytecode: `0x${string}`;
}

export type BuildStep = "prompt" | "generating" | "review" | "compiling" | "deploying" | "success";
