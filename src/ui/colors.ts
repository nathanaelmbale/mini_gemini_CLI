// Raw ANSI escape codes. \x1b[ is the "escape" that tells the terminal
// "an instruction follows, not literal text" — the number sets a style,
// and \x1b[0m always resets back to normal.
const RESET = "\x1b[0m";

export function cyan(text: string): string {
  return `\x1b[36m${text}${RESET}`;
}

export function green(text: string): string {
  return `\x1b[32m${text}${RESET}`;
}

export function yellow(text: string): string {
  return `\x1b[33m${text}${RESET}`;
}

export function magenta(text: string): string {
  return `\x1b[35m${text}${RESET}`;
}

export function dim(text: string): string {
  return `\x1b[2m${text}${RESET}`;
}

export function bold(text: string): string {
  return `\x1b[1m${text}${RESET}`;
}

export function box(title: string, lines: string[]): string {
  const content = [title, "", ...lines];
  const width = Math.max(...content.map((l) => l.length)) + 2;

  const top = `┌${"─".repeat(width)}┐`;
  const bottom = `└${"─".repeat(width)}┘`;
  const body = content.map((l) => `│ ${l.padEnd(width - 1)}│`).join("\n");

  return `${top}\n${body}\n${bottom}`;
}