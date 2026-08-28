import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function shellTool(args: { command: string }): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(args.command, {
      cwd: process.cwd(),
      timeout: 15_000,
    });
    return stderr ? `${stdout}\n[stderr]\n${stderr}` : stdout;
  } catch (err) {
    // exec throws on non-zero exit code — surface it as a tool result,
    // not a crash, so the model can see the failure and react to it
    const e = err as { stdout?: string; stderr?: string; message: string };
    return `Command failed: ${e.message}\n${e.stdout ?? ""}\n${e.stderr ?? ""}`;
  }
}