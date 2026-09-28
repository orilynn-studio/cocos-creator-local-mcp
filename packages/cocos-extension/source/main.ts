/** Copyright 2026 InnoLotus Pty Ltd. Licensed under Apache-2.0. */
// @ts-ignore
import manifest from '../package.json';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

const host = '127.0.0.1'; const port = 47385; let httpServer: ReturnType<typeof createServer> | undefined;
const actions = ['scene_tree', 'node_details', 'scene_status', 'list_components', 'project_scripts', 'asset_search', 'asset_details', 'create_node', 'duplicate_node', 'move_node', 'delete_node', 'add_component', 'remove_component', 'save_scene', 'undo', 'redo', 'focus_nodes'];

function json(response: ServerResponse, status: number, body: unknown): void { response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' }); response.end(JSON.stringify(body)); }
async function body(request: IncomingMessage): Promise<Record<string, unknown>> { const chunks: Buffer[] = []; for await (const chunk of request) chunks.push(chunk as Buffer); return JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>; }
async function invoke(id: string, args: Record<string, unknown>): Promise<unknown> {
    if (!actions.includes(id)) throw new Error(`Unknown action: ${id}`);
    if (id === 'scene_tree') return Editor.Message.request('scene', 'query-node-tree');
    if (id === 'scene_status') { const [ready, dirty, bounds, is2D] = await Promise.all([Editor.Message.request('scene', 'query-is-ready'), Editor.Message.request('scene', 'query-dirty'), Editor.Message.request('scene', 'query-scene-bounds'), Editor.Message.request('scene', 'query-is2D')]); return { ready, dirty, bounds, is2D }; }
    if (id === 'node_details') return Editor.Message.request('scene', 'query-node', args.uuid as string);
    if (id === 'list_components') return Editor.Message.request('scene', 'query-classes', { extends: 'cc.Component' });
    if (id === 'project_scripts') return Editor.Message.request('scene', 'query-components');
    if (id === 'asset_search') return Editor.Message.request('asset-db', 'query-assets', args, ['name', 'url', 'uuid', 'type', 'isDirectory']);
    if (id === 'asset_details') return Editor.Message.request('asset-db', 'query-asset-info', args.id as string);
    if (id === 'create_node') return Editor.Message.request('scene', 'create-node', { name: args.name as string, parent: args.parent as string | undefined, position: args.position as { x: number; y: number; z: number } | undefined, snapshot: true });
    if (id === 'duplicate_node') return Editor.Message.request('scene', 'duplicate-node', args.uuid as string);
    if (id === 'move_node') return Editor.Message.request('scene', 'set-parent', { uuids: args.uuid as string, parent: args.parent as string, keepWorldTransform: args.keepWorldTransform === true });
    if (id === 'delete_node') return Editor.Message.request('scene', 'remove-node', { uuid: args.uuid as string });
    if (id === 'add_component') return Editor.Message.request('scene', 'create-component', { uuid: args.uuid as string, component: args.component as string });
    if (id === 'remove_component') return Editor.Message.request('scene', 'remove-component', { uuid: args.uuid as string });
    if (id === 'save_scene' || id === 'undo' || id === 'redo') return Editor.Message.request('scene', id === 'save_scene' ? 'save-scene' : id);
    return Editor.Message.request('scene', 'focus-camera', args.uuids as string[]);
}
export const methods = { openPanel(): void { Editor.Panel.open(manifest.name); }, getStatus() { return { connected: Boolean(httpServer?.listening), url: `http://${host}:${port}`, tools: actions }; } };
export function load(): void { httpServer = createServer(async (request, response) => { try { if (request.method === 'GET' && request.url === '/act-node/actions') return json(response, 200, { actions }); if (request.method === 'POST' && request.url === '/act-node/invoke') { const input = await body(request); return json(response, 200, { result: await invoke(input.id as string, (input.arguments ?? {}) as Record<string, unknown>) }); } return json(response, 404, { error: 'Use GET /act-node/actions or POST /act-node/invoke.' }); } catch (error) { return json(response, 400, { error: error instanceof Error ? error.message : String(error) }); } }); httpServer.listen(port, host); }
export function unload(): void { httpServer?.close(); httpServer = undefined; }
