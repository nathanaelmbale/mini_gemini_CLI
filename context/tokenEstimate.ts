import type { ChatMessage } from "../src/types.js";

// Rough heuristic: ~1.3 tokens per word. Good enough to decide "is this
// getting big" — not meant to match the API's real tokenizer exactly.
export function estimateTokens(history: Array<ChatMessage>): number {
  const text = JSON.stringify(history);
  const wordCount = text.split(/\s+/).length;
  return Math.round(wordCount * 1.3);
}