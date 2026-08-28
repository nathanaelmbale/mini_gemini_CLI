import { readdir } from "node:fs/promises";
import { resolve } from "node:path";

export async function listDirectoryTool(args: { path: string }): Promise<string> {
  const safePath = resolve(process.cwd(), args.path);

  if (!safePath.startsWith(process.cwd())) {
    throw new Error("Access denied: path is outside the project directory");
  }

  const entries = await readdir(safePath, { withFileTypes: true });
  return entries.map((e) => (e.isDirectory() ? `${e.name}/` : e.name)).join("\n");
}