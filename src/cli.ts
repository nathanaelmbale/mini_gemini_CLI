import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { toolDeclarations, executeTool } from "../tools/registry.js";
import { requiresPermission, askPermission } from "../tools/permisson.js";

type ChatMessage = {
    role: "user" | "model";
    //parts: { text: string }[];
    parts: Array<Record<string, unknown>>;

};

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("Missing GEMINI_API_KEY in .env");
        process.exit(1);
    }

    const ai = new GoogleGenAI({ apiKey });
    const history: ChatMessage[] = [];
    const rl = readline.createInterface({ input: stdin, output: stdout });

    console.log("mini-agent — type your message, or /exit to quit\n");

    while (true) {
        const userInput = await rl.question("> ");

        if (userInput.trim() === "/exit") {
            break;
        }

        history.push({ role: "user", parts: [{ text: userInput }] });

        try {
            await handleTurn(ai, history);
            //const response = await ai.models.generateContent({
            //    model: "gemini-3.6-flash",
            //    contents: history,
            //    config: {
            //        maxOutputTokens: 40,
            //        systemInstruction: "Answer in 10 words or fewer. Be terse. This is a dev/testing mode.",
            //    }
            //});

            //const reply = response.text ?? "";
            //console.log(reply, "\n");

            //history.push({ role: "model", parts: [{ text: reply }] });
        } catch (err) {
            console.error("Error calling Gemini API:", err);
            // Don't push a model turn if the call failed — keeps history consistent
            history.pop();
        }
    }

    rl.close();
}

const MAX_AGENT_STEPS = 5;

async function handleTurn(ai: GoogleGenAI, history: ChatMessage[]): Promise<void> {
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

        //console.log("here", functionCalls)


        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0]!;
            console.log(`[Tool] ${call.name}`, call.args);

            let result: string;

            if (requiresPermission(call.name!) && !(await askPermission(call.name!, call.args ?? {}))) {
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
        console.log(reply, "\n");
        history.push({ role: "model", parts: [{ text: reply }] });
        return;
    }

    console.log(`[Agent stopped after ${MAX_AGENT_STEPS} steps without a final answer]\n`);
}

main();