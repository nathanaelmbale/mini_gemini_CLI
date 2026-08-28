import figlet from "figlet";
import { dim, yellow } from "./colors.js";

// Interpolates between two RGB colors across the width of the text,
// coloring each column so the whole banner reads as one smooth gradient
// rather than solid single-color text.
function gradientText(text: string, from: [number, number, number], to: [number, number, number]): string {
  const lines = text.split("\n");
  const maxLen = Math.max(...lines.map((l) => l.length));

  return lines
    .map((line) =>
      line
        .split("")
        .map((char, i) => {
          const t = maxLen <= 1 ? 0 : i / (maxLen - 1);
          const r = Math.round(from[0] + (to[0] - from[0]) * t);
          const g = Math.round(from[1] + (to[1] - from[1]) * t);
          const b = Math.round(from[2] + (to[2] - from[2]) * t);
          return `\x1b[38;2;${r};${g};${b}m${char}\x1b[0m`;
        })
        .join(""),
    )
    .join("\n");
}

export function renderBanner(): string {
  const ascii = figlet.textSync("MINI-AGENT", { font: "ANSI Shadow" });
  // blue → pink, roughly matching the Gemini CLI banner's palette
  return gradientText(ascii, [80, 130, 246], [236, 120, 160]);
}

export function renderFooter(): string {
  const cwd = process.cwd().split(/[\\/]/).slice(-2).join("/");
  return dim(`~/${cwd}`) + "   " + yellow("no sandbox") + "   " + dim("auto");
}