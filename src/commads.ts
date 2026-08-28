import type { ChatMessage } from "../src/types.js";
import { toolDeclarations } from "../tools/registry.js";

// Returns true if the input was a recognized slash command (and was handled).
// Returns false if it wasn't a command, so the caller should treat it as a
// normal message to send to the model.
export function handleSlashCommand(input: string, history: ChatMessage[]): boolean {
  const command = input.trim();

  switch (command) {
    case "/help":
      console.log(
        "Commands:\n" +
          "  /help     Show this message\n" +
          "  /tools    List available tools\n" +
          "  /history  Show conversation turn count\n" +
          "  /clear    Reset conversation history\n" +
          "  /exit     Quit\n",
      );
      return true;

    case "/tools":
      console.log(toolDeclarations.map((t) => `  ${t.name} — ${t.description}`).join("\n") + "\n");
      return true;

    case "/history":
      console.log(`${history.length} turns in history\n`);
      return true;

    case "/clear":
      history.length = 0; // mutate in place so the caller's reference stays valid
      console.log("History cleared\n");
      return true;

    default:
      return false;
  }
}