import { Type, type FunctionDeclaration } from "@google/genai";
import { readFileTool } from "./readFile.js";
import { listDirectoryTool } from "./listDirectory.js";
import { writeFileTool } from "./writeFile.js";
import { shellTool } from "./shell.js";

export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: "read_file",
    description: "Read the contents of a file at a given relative path.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        path: { type: Type.STRING, description: "Relative path to the file" },
      },
      required: ["path"],
    },
  },
  {
    name: "list_directory",
    description: "List files and folders inside a given relative directory path.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        path: { type: Type.STRING, description: "Relative path to the directory" },
      },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description: "Write content to a file at a given relative path, overwriting it if it exists.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        path: { type: Type.STRING, description: "Relative path to the file" },
        content: { type: Type.STRING, description: "Content to write" },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "run_command",
    description: "Run a shell command in the project directory and return its output.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        command: { type: Type.STRING, description: "The shell command to run" },
      },
      required: ["command"],
    },
  },
];

export async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case "read_file":
      return await readFileTool(args as { path: string });
    case "list_directory":
      return await listDirectoryTool(args as { path: string });
    case "write_file":
      return await writeFileTool(args as { path: string; content: string });
    case "run_command":
      return await shellTool(args as { command: string });
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}