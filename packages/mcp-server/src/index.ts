/** Copyright 2026 InnoLotus Pty Ltd. Licensed under Apache-2.0. */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StaticActionCatalog, type ActNodeActionDescriptor, type JsonObject } from '@innolotus/cocos-act-node';
import { z } from 'zod';

const bridgeUrl = process.env.COCOS_AGENT_BRIDGE_URL ?? 'http://127.0.0.1:47385';

const actions: readonly ActNodeActionDescriptor[] = [
    descriptor('scene_tree', 'Scene tree', 'Read the open scene hierarchy.', true),
    descriptor('node_details', 'Node details', 'Read a node by UUID.', true, ['uuid']),
    descriptor('scene_status', 'Scene status', 'Read the scene readiness and dirty state.', true),
    descriptor('list_components', 'Component catalog', 'List Cocos Component classes.', true),
    descriptor('project_scripts', 'Project scripts', 'List project scripts.', true),
    descriptor('asset_search', 'Asset search', 'Search the asset database.', true),
    descriptor('asset_details', 'Asset details', 'Read asset metadata.', true, ['id']),
    descriptor('create_node', 'Create node', 'Create a node in the open scene.', false, ['name']),
    descriptor('duplicate_node', 'Duplicate node', 'Duplicate a scene node.', false, ['uuid']),
    descriptor('move_node', 'Move node', 'Reparent a scene node.', false, ['uuid', 'parent']),
    descriptor('delete_node', 'Delete node', 'Remove a scene node.', false, ['uuid'], true),
    descriptor('add_component', 'Add Component', 'Attach a Component to a node.', false, ['uuid', 'component']),
    descriptor('remove_component', 'Remove Component', 'Remove a Component.', false, ['uuid'], true),
    descriptor('save_scene', 'Save scene', 'Save the open Creator scene.', false),
    descriptor('undo', 'Undo', 'Undo the latest Creator scene change.', false),
    descriptor('redo', 'Redo', 'Redo the latest Creator scene change.', false),
    descriptor('focus_nodes', 'Focus nodes', 'Focus Creator on scene nodes.', false, ['uuids']),
];

function descriptor(id: string, title: string, description: string, readOnly: boolean, required: string[] = [], destructive = false): ActNodeActionDescriptor {
    return { id, title, description, inputSchema: { type: 'object', properties: {}, required }, hints: { readOnly, destructive, idempotent: readOnly }, requiredCapabilities: [] };
}

async function invoke(id: string, arguments_: JsonObject): Promise<unknown> {
    const response = await fetch(`${bridgeUrl}/act-node/invoke`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, arguments: arguments_ }) });
    const payload = await response.json() as { result?: unknown; error?: string };
    if (!response.ok) throw new Error(payload.error ?? `Agent Bridge returned ${response.status}`);
    return payload.result;
}

const catalog = new StaticActionCatalog(actions);
const server = new McpServer({ name: 'cocos-agent-bridge', version: '0.1.0' });

for (const action of catalog.list()) {
    server.tool(action.id, action.description, { arguments: z.record(z.unknown()).default({}) }, { title: action.title, readOnlyHint: action.hints.readOnly, destructiveHint: action.hints.destructive, idempotentHint: action.hints.idempotent, openWorldHint: false }, async ({ arguments: arguments_ }) => ({ content: [{ type: 'text', text: JSON.stringify(await invoke(action.id, arguments_), null, 2) }] }));
}

await server.connect(new StdioServerTransport());
