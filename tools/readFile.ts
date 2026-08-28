import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export async function readFileTool(args: { path: string }): Promise<string> {
  const safePath = resolve(process.cwd(), args.path);

  if (!safePath.startsWith(process.cwd())) {
    throw new Error("Access denied: path is outside the project directory");
  }

  return await readFile(safePath, "utf-8");
}