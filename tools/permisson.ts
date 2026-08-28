import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

// Tools listed here require explicit user approval before executing.
const DANGEROUS_TOOLS = new Set(["run_command", "write_file"]);

export function requiresPermission(toolName: string): boolean {
  return DANGEROUS_TOOLS.has(toolName);
}

export async function askPermission(toolName: string, args: Record<string, unknown>): Promise<boolean> {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const argsPreview = JSON.stringify(args);
  const answer = await rl.question(`Allow ${toolName} ${argsPreview}? [y/N] `);
  rl.close();
  return answer.trim().toLowerCase() === "y";
}