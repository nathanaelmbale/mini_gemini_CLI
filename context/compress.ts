import type { GoogleGenAI } from "@google/genai";
import type { ChatMessage } from "../src/types.js";
import { estimateTokens } from "./tokenEstimate.js";

const COMPRESSION_THRESHOLD_TOKENS = 200;
const KEEP_RECENT_TURNS = 4;

export async function compressHistoryIfNeeded(
  ai: GoogleGenAI,
  history: ChatMessage[],
): Promise<ChatMessage[]> {
  if (estimateTokens(history) < COMPRESSION_THRESHOLD_TOKENS) {
    return history;
  }

  if (history.length <= KEEP_RECENT_TURNS) {
    return history; // nothing old enough to safely compress
  }

  const toCompress = history.slice(0, -KEEP_RECENT_TURNS);
  const toKeep = history.slice(-KEEP_RECENT_TURNS);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                "Summarize the following conversation history concisely, " +
                "preserving key facts, file contents discovered, and decisions made. " +
                "This summary will replace the raw history, so include anything a " +
                "continuing agent would need to know:\n\n" +
                JSON.stringify(toCompress),
            },
          ],
        },
      ],
    });

    const summary = response.text ?? "(summary unavailable)";

    const summaryTurn: ChatMessage = {
      role: "user",
      parts: [{ text: `[Earlier conversation summary]: ${summary}` }],
    };

    console.log(`[Context compressed: ${toCompress.length} turns → 1 summary turn]\n`);

    return [summaryTurn, ...toKeep];
  } catch (err) {
    // If compression itself fails, don't lose history — just proceed
    // uncompressed and let the next natural check try again
    console.error("Context compression failed, continuing with full history:", err);
    return history;
  }
}