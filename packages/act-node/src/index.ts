/** Copyright 2026 InnoLotus Pty Ltd. Licensed under Apache-2.0. */

import {
    createActionCatalog,
    createActionDescriptor,
    type ActNodeActionCatalog,
    type ActNodeActionDescriptor,
    type JsonObject,
} from '@innolotus/ivy-act-node-protocol';

export type { ActNodeActionCatalog, ActNodeActionDescriptor, JsonObject };

const readActions = new Set(['scene_tree', 'node_details', 'scene_status', 'list_components', 'project_scripts', 'asset_search', 'asset_details']);
const destructiveActions = new Set(['delete_node', 'remove_component']);

/** The canonical Cocos action contract shared by both public transports. */
export const COCOS_ACTIONS: readonly ActNodeActionDescriptor[] = Object.freeze([
    'scene_tree', 'node_details', 'scene_status', 'list_components', 'project_scripts', 'asset_search', 'asset_details',
    'create_node', 'duplicate_node', 'move_node', 'delete_node', 'add_component', 'remove_component', 'save_scene', 'undo', 'redo', 'focus_nodes',
].map((id) => {
    const created = createActionDescriptor({
        id,
        title: id.replaceAll('_', ' '),
        description: `Cocos Creator action: ${id}.`,
        inputSchema: { type: 'object' },
        hints: { readOnly: readActions.has(id), destructive: destructiveActions.has(id), idempotent: readActions.has(id) },
        requiredCapabilities: [],
    });
    if (!created.succeeded) throw new Error(`Invalid canonical Cocos action: ${id}`);
    return created.value;
}));

/**
 * Builds the single catalog consumed by both the local Act Node endpoint and
 * the MCP projection. Invalid or ambiguous actions fail before they can be
 * exposed by either transport.
 */
export function createCocosActionCatalog(actions: readonly ActNodeActionDescriptor[]): ActNodeActionCatalog {
    const result = createActionCatalog(actions);
    if (!result.succeeded) throw new Error(result.issues.map((issue) => issue.message).join(' '));
    return result.value;
}
