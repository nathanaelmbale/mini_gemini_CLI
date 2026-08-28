export type ChatMessage = {
  role: "user" | "model";
  parts: Array<Record<string, unknown>>;
}