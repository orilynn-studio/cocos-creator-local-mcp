/** Copyright 2026 InnoLotus Pty Ltd. Licensed under Apache-2.0. */
// @ts-ignore
import manifest from '../package.json';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { COCOS_ACTIONS, type JsonObject } from '@innolotus/cocos-act-node';
import {
    ACT_NODE_HOST_PROFILE,
    ActNodeHost,
    callerVerified,
    createInvocationRequest,
    trustedContextCreated,
    type ActNodeActionRegistration,
} from '@innolotus/ivy-act-node-host';
import { ALLOW_ACT_NODE_EXECUTION, GovernedActNodeInvoker, type ActNodeAuditSink } from '@innolotus/ivy-act-node-host-governance';
import { snapshotJson, type JsonValue } from '@innolotus/ivy-act-node-protocol';
import { handleMcpRequest } from './mcp-route.js';

const host = '127.0.0.1'; const port = 47385; const nodePath = 'cocos/demo'; let httpServer: ReturnType<typeof createServer> | undefined;
const actions = COCOS_ACTIONS.map((action) => action.id);

function json(response: ServerResponse, status: number, body: unknown): void { response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' }); response.end(JSON.stringify(body)); }
async function body(request: IncomingMessage): Promise<Record<string, unknown>> { const chunks: Buffer[] = []; for await (const chunk of request) chunks.push(chunk as Buffer); return JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>; }
function editorResult(value: unknown): JsonValue { return snapshotJson(value as JsonValue); }
async function executeEditorAction(id: string, args: JsonObject): Promise<JsonValue> {
    if (!actions.includes(id)) throw new Error(`Unknown action: ${id}`);
    if (id === 'scene_tree') return editorResult(await Editor.Message.request('scene', 'query-node-tree'));
    if (id === 'scene_status') { const [ready, dirty, bounds, is2D] = await Promise.all([Editor.Message.request('scene', 'query-is-ready'), Editor.Message.request('scene', 'query-dirty'), Editor.Message.request('scene', 'query-scene-bounds'), Editor.Message.request('scene', 'query-is2D')]); return editorResult({ ready, dirty, bounds, is2D }); }
    if (id === 'node_details') return editorResult(await Editor.Message.request('scene', 'query-node', args.uuid as string));
    if (id === 'list_components') return editorResult(await Editor.Message.request('scene', 'query-classes', { extends: 'cc.Component' }));
    if (id === 'project_scripts') return editorResult(await Editor.Message.request('scene', 'query-components'));
    if (id === 'asset_search') return editorResult(await Editor.Message.request('asset-db', 'query-assets', args, ['name', 'url', 'uuid', 'type', 'isDirectory']));
    if (id === 'asset_details') return editorResult(await Editor.Message.request('asset-db', 'query-asset-info', args.id as string));
    if (id === 'create_node') return editorResult(await Editor.Message.request('scene', 'create-node', { name: args.name as string, parent: args.parent as string | undefined, position: args.position as { x: number; y: number; z: number } | undefined, snapshot: true }));
    if (id === 'duplicate_node') return editorResult(await Editor.Message.request('scene', 'duplicate-node', args.uuid as string));
    if (id === 'move_node') return editorResult(await Editor.Message.request('scene', 'set-parent', { uuids: args.uuid as string, parent: args.parent as string, keepWorldTransform: args.keepWorldTransform === true }));
    if (id === 'delete_node') return editorResult(await Editor.Message.request('scene', 'remove-node', { uuid: args.uuid as string }));
    if (id === 'add_component') return editorResult(await Editor.Message.request('scene', 'create-component', { uuid: args.uuid as string, component: args.component as string }));
    if (id === 'remove_component') return editorResult(await Editor.Message.request('scene', 'remove-component', { uuid: args.uuid as string }));
    if (id === 'save_scene' || id === 'undo' || id === 'redo') { await Editor.Message.request('scene', id === 'save_scene' ? 'save-scene' : id); return null; }
    await Editor.Message.request('scene', 'focus-camera', args.uuids as string[]); return null;
}
const auditSink: ActNodeAuditSink = {
    async writePreDispatch(event): Promise<void> { console.info(`[Agent Bridge] invoke ${event.actionId} trace=${event.traceId}`); },
    async writeOutcome(event): Promise<void> { console.info(`[Agent Bridge] outcome ${event.actionId}=${event.outcome}${event.code ? ` code=${event.code}` : ''}`); },
};
const registrations: readonly ActNodeActionRegistration[] = COCOS_ACTIONS.map((descriptor) => ({ descriptor, handler: { invoke: async (_context, parameters) => executeEditorAction(descriptor.id, parameters) } }));
const governedInvoker = new GovernedActNodeInvoker({
    registrations,
    authorizationPolicy: { authorize: async () => ALLOW_ACT_NODE_EXECUTION },
    containmentPolicy: { validate: async () => ALLOW_ACT_NODE_EXECUTION },
    sandboxPolicy: { evaluate: async () => ALLOW_ACT_NODE_EXECUTION },
    auditSink,
});
const actNodeHost = new ActNodeHost({
    catalog: governedInvoker.actionCatalog,
    callerVerifier: { verify: async () => callerVerified({ subjectId: 'cocos-agent-bridge-loopback', issuer: 'cocos-agent-bridge', audience: ACT_NODE_HOST_PROFILE.audience, assurance: 'loopback', verifiedAt: new Date().toISOString() }) },
    trustedContextFactory: { create: async (_caller, request) => trustedContextCreated({ subjectId: 'cocos-agent-bridge-loopback', traceId: request.requestId ?? crypto.randomUUID(), approvalId: undefined, capabilities: new Set(), resourceScope: 'cocos-editor:current-project' }) },
    governedInvoker,
});

export const methods = { openPanel(): void { Editor.Panel.open(manifest.name); }, getStatus() { return { connected: Boolean(httpServer?.listening), address: `nwp://${host}:${port}/${nodePath}`, actHttpUrl: `http://${host}:${port}/act`, mcpHttpUrl: `http://${host}:${port}/mcp`, tools: actNodeHost.actions.map((action) => action.id) }; } };
export function load(): void { httpServer = createServer(async (request, response) => { try { if (request.method === 'GET' && request.url === '/act/actions') return json(response, 200, { actions: actNodeHost.actions }); if (request.method === 'POST' && request.url === '/act/invoke') { const input = await body(request); const created = createInvocationRequest({ actionId: input.id as string, parameters: input.arguments ?? {}, requestId: crypto.randomUUID() }); if (!created.succeeded) return json(response, 400, { error: created.diagnostic.message }); const result = await actNodeHost.invoke(created.request, { encodedLengthInBytes: Number(request.headers['content-length'] ?? 0) }); return result.succeeded ? json(response, 200, { result: result.value }) : json(response, 400, { error: result.diagnostic.message, code: result.diagnostic.code }); } if (request.url === '/mcp') return handleMcpRequest(request, response, actNodeHost); return json(response, 404, { error: 'Use GET /act/actions, POST /act/invoke, or /mcp.' }); } catch { return json(response, 400, { error: 'Agent Bridge rejected the request.' }); } }); httpServer.listen(port, host); }
export function unload(): void { httpServer?.close(); httpServer = undefined; }
