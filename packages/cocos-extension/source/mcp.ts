/** Copyright 2026 InnoLotus Pty Ltd. Licensed under Apache-2.0. */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { COCOS_ACTIONS } from '@innolotus/cocos-act-node';
import { createInvocationRequest, type ActNodeHost } from '@innolotus/ivy-act-node-host';
import { isJsonObject } from '@innolotus/ivy-act-node-protocol';

/** Creates one stateless MCP projection; execution remains in the supplied Ivy Host. */
export function createCocosMcpServer(host: ActNodeHost): McpServer {
    const server = new McpServer({ name: 'cocos-agent-bridge', version: '1.0.0-beta.1' });
    for (const action of COCOS_ACTIONS) (server.tool as (...items: unknown[]) => void)(action.id, action.description ?? action.id, { arguments: z.record(z.unknown()).default({}) }, { title: action.title, readOnlyHint: action.hints.readOnly, destructiveHint: action.hints.destructive, idempotentHint: action.hints.idempotent }, async ({ arguments: args }: { arguments: unknown }) => {
        if (!isJsonObject(args)) throw new Error('Tool arguments must be a JSON object.');
        const request = createInvocationRequest({ actionId: action.id, parameters: args, requestId: crypto.randomUUID() });
        if (!request.succeeded) throw new Error(request.diagnostic.message);
        const result = await host.invoke(request.request, { encodedLengthInBytes: 0 });
        if (!result.succeeded) throw new Error(result.diagnostic.message);
        return { content: [{ type: 'text', text: JSON.stringify(result.value, null, 2) }] };
    });
    return server;
}
