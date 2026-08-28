import type { Interface } from "node:readline/promises";
import { yellow } from "./ui/colors.js";

const DANGEROUS_TOOLS = new Set(["run_command", "write_file"]);

export function requiresPermission(toolName: string): boolean {
  return DANGEROUS_TOOLS.has(toolName);
}

export async function askPermission(
  rl: Interface,
  toolName: string,
  args: Record<string, unknown>,
): Promise<boolean> {
  const argsPreview = JSON.stringify(args);
  const answer = await rl.question(yellow(`Allow ${toolName} ${argsPreview}? [y/N] `));
  return answer.trim().toLowerCase() === "y";
}