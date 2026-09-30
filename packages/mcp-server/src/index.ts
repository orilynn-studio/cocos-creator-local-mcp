/** Copyright 2026 InnoLotus Pty Ltd. Licensed under Apache-2.0. */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { COCOS_ACTIONS, createCocosActionCatalog, type JsonObject } from '@innolotus/cocos-act-node';
import { isJsonObject } from '@innolotus/ivy-act-node-protocol';
import { z } from 'zod';

const bridgeUrl = process.env.COCOS_AGENT_BRIDGE_URL ?? 'http://127.0.0.1:47385';


async function invoke(id: string, arguments_: JsonObject): Promise<unknown> {
    const response = await fetch(`${bridgeUrl}/act/invoke`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, arguments: arguments_ }) });
    const payload = await response.json() as { result?: unknown; error?: string };
    if (!response.ok) throw new Error(payload.error ?? `Agent Bridge returned ${response.status}`);
    return payload.result;
}

const catalog = createCocosActionCatalog(COCOS_ACTIONS);
const server = new McpServer({ name: 'cocos-agent-bridge', version: '1.0.0-beta.1' });

for (const action of catalog.actions) {
    server.tool(action.id, action.description ?? action.id, { arguments: z.record(z.unknown()).default({}) }, { title: action.title, readOnlyHint: action.hints.readOnly, destructiveHint: action.hints.destructive, idempotentHint: action.hints.idempotent, openWorldHint: false }, async ({ arguments: arguments_ }) => {
        if (!isJsonObject(arguments_)) throw new Error('Tool arguments must be a JSON object.');
        return { content: [{ type: 'text', text: JSON.stringify(await invoke(action.id, arguments_), null, 2) }] };
    });
}

await server.connect(new StdioServerTransport());
