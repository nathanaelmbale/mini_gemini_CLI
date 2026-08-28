import { toolDeclarations, executeTool } from "../tools/registry.js";
//import { requiresPermission, askPermission } from "./tools/permission.js";

/** ...inside handleTurn, replace the functionCalls block with:

  if (functionCalls && functionCalls.length > 0) {
    const call = functionCalls[0];
    console.log(`[Tool] ${call.name}`, call.args);

    let result: string;

    if (requiresPermission(call.name!) && !(await askPermission(call.name!, call.args ?? {}))) {
      result = "User denied permission to run this tool.";
    } else {
      try {
        result = await executeTool(call.name!, call.args ?? {});
      } catch (err) {
        result = `Error: ${(err as Error).message}`;
      }
    }

    history.push({ role: "model", parts: [{ functionCall: call }] });
    history.push({
      role: "user",
      parts: [{ functionResponse: { name: call.name, response: { result } } }],
    });

    await handleTurn(ai, history);
    return;
  } **/