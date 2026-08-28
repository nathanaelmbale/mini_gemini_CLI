import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { toolDeclarations, executeTool } from "../tools/registry.js";
import { handleSlashCommand } from "./commads.js";
import { requiresPermission, askPermission } from "./permisson.js";
import { compressHistoryIfNeeded } from "../context/compress.js";
import type { ChatMessage } from "./types.js";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { cyan, green, yellow, magenta, dim, bold } from "./ui/colors.js";


function parseArgs(argv: string[]): { message?: string; filePath?: string } {
    let filePath: string | undefined;
    const rest: string[] = [];

    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === "--file") {
            filePath = argv[i + 1];
            i++; // skip the consumed value
        } else {
            rest.push(argv[i]!);
        }
    }

    const args: { message?: string; filePath?: string } = {};
    if (rest.length > 0) {
        args.message = rest.join(" ");
    }
    if (filePath !== undefined) {
        args.filePath = filePath;
    }
    return args;
}

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("Missing GEMINI_API_KEY in .env");
        process.exit(1);
    }

    const ai = new GoogleGenAI({ apiKey });
    const { message, filePath } = parseArgs(process.argv.slice(2));

    let history: ChatMessage[] = [];
    const rl = readline.createInterface({ input: stdin, output: stdout });

    try {
        if (filePath) {
            const fileContent = await readFile(resolve(process.cwd(), filePath), "utf-8");
            history.push({
                role: "user",
                parts: [{ text: `Here is the content of ${filePath}:\n\n${fileContent}` }],
            });
        }

        if (message) {
            history.push({ role: "user", parts: [{ text: message }] });
            await handleTurn(ai, history, rl);
            return; // one-shot done — falls through to finally below
        }

        console.log(cyan(bold("\n✦ mini-agent")) + dim(" — type your message, or /exit to quit\n"));

        while (true) {
            const userInput = await rl.question(cyan("> "));

            if (userInput.trim() === "/exit") {
                break;
            }
            if (handleSlashCommand(userInput, history)) {
                continue;
            }

            history.push({ role: "user", parts: [{ text: userInput }] });

            try {
                history = await compressHistoryIfNeeded(ai, history);
                await handleTurn(ai, history, rl);
            } catch (err) {
                console.error("Error calling Gemini API:", err);
                history.pop();
            }
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        rl.close();
    }
}



const MAX_AGENT_STEPS = 10;

async function handleTurn(ai: GoogleGenAI, history: Array<ChatMessage>, rl: readline.Interface): Promise<void> {
    for (let step = 0; step < MAX_AGENT_STEPS; step++) {
        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: history,
            config: {
                //maxOutputTokens: 200,
                systemInstruction: "Answer in 10 words or fewer. Be terse. This is a dev/testing mode.",
                tools: [{ functionDeclarations: toolDeclarations }],
            },
        })

        const functionCalls = response.functionCalls!;



        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0]!;

            console.log(magenta(`[Tool] ${call.name}`), dim(JSON.stringify(call.args)));

            let result: string;

            if (requiresPermission(call.name!) && !(await askPermission(rl, call.name!, call.args ?? {}))) {
                result = "Permission denied by user.";
            } else {
                try {
                    result = await executeTool(call.name!, call.args ?? {});
                } catch (err) {
                    result = `Error: ${(err as Error).message}`;
                }
            }

            const modelTurn = response.candidates?.[0]?.content;
            if (!modelTurn) {
                throw new Error("Gemini returned a tool call without model content.");
            }

            history.push(modelTurn as ChatMessage);
            history.push({
                role: "user",
                parts: [{ functionResponse: { name: call.name, response: { result } } }],
            });

            continue;
        }

        const reply = response.text ?? "";
        console.log(cyan(reply) + "\n");
        history.push({ role: "model", parts: [{ text: reply }] });
        return;
    }

    console.log(magenta(`[Agent stopped after ${MAX_AGENT_STEPS} steps without a final answer]\n`));
}

main();