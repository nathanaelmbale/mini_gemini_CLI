import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export async function writeFileTool(args: { path: string; content: string }): Promise<string> {
  const safePath = resolve(process.cwd(), args.path);

  if (!safePath.startsWith(process.cwd())) {
    throw new Error("Access denied: path is outside the project directory");
  }

  await writeFile(safePath, args.content, "utf-8");
  return `Wrote ${args.content.length} characters to ${args.path}`;
}