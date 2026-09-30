/** Copyright 2026 InnoLotus Pty Ltd. Licensed under Apache-2.0. */
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ActNodeHost } from '@innolotus/ivy-act-node-host';
import { createCocosMcpServer } from './mcp.js';

async function parseBody(request: IncomingMessage): Promise<unknown> {
    if (request.method !== 'POST') return undefined;
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(chunk as Buffer);
    const text = Buffer.concat(chunks).toString('utf8');
    return text.length === 0 ? undefined : JSON.parse(text);
}

/** Handles one stateless MCP Streamable HTTP request through the shared Host. */
export async function handleMcpRequest(request: IncomingMessage, response: ServerResponse, host: ActNodeHost): Promise<void> {
    const server = createCocosMcpServer(host);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    await server.connect(transport);
    response.once('close', () => { void transport.close(); void server.close(); });
    await transport.handleRequest(request, response, await parseBody(request));
}
