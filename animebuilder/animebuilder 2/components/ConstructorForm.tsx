"use client";

import { ConstructorArg } from "@/lib/types";

interface Props {
  args: ConstructorArg[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export function ConstructorForm({ args, values, onChange }: Props) {
  if (args.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 text-sm text-green-200">
        ✓ No configuration needed — this contract deploys with no parameters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {args.map((arg) => (
        <div key={arg.name}>
          <div className="flex items-center gap-2 mb-1.5">
            <label className="text-sm font-medium text-white/80">{arg.label}</label>
            <span className="text-xs text-white/30 bg-white/5 px-1.5 py-0.5 rounded font-mono">
              {arg.type}
            </span>
          </div>

          {arg.type === "bool" ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <input
                id={arg.name}
                type="checkbox"
                className="w-4 h-4 accent-purple-500"
                checked={values[arg.name] === "true"}
                onChange={(e) => onChange(arg.name, e.target.checked ? "true" : "false")}
              />
              <label htmlFor={arg.name} className="text-sm text-white/60 cursor-pointer">
                {arg.description}
              </label>
            </div>
          ) : (
            <input
              className="anime-input"
              type={arg.type === "uint256" ? "number" : "text"}
              min={arg.type === "uint256" ? "0" : undefined}
              placeholder={arg.placeholder}
              value={values[arg.name] ?? arg.defaultValue ?? ""}
              onChange={(e) => onChange(arg.name, e.target.value)}
            />
          )}

          {arg.type !== "bool" && arg.description && (
            <p className="text-xs text-white/30 mt-1">{arg.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
