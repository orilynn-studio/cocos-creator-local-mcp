/** Copyright 2026 InnoLotus Pty Ltd. Licensed under Apache-2.0. */

export type JsonObject = Record<string, unknown>;

export interface ActNodeActionHints {
    readonly readOnly?: boolean;
    readonly destructive?: boolean;
    readonly idempotent?: boolean;
}

export interface ActNodeActionDescriptor {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly inputSchema: JsonObject;
    readonly outputSchema?: JsonObject;
    readonly hints: ActNodeActionHints;
    readonly requiredCapabilities: readonly string[];
}

export interface ActNodeInvocation {
    readonly id: string;
    readonly arguments: JsonObject;
}

export interface ActNodeActionCatalog {
    list(): readonly ActNodeActionDescriptor[];
    get(id: string): ActNodeActionDescriptor | undefined;
}

export class StaticActionCatalog implements ActNodeActionCatalog {
    private readonly entries = new Map<string, ActNodeActionDescriptor>();

    public constructor(actions: readonly ActNodeActionDescriptor[]) {
        for (const action of actions) {
            if (this.entries.has(action.id)) throw new Error(`Duplicate ActNode action: ${action.id}`);
            this.entries.set(action.id, action);
        }
    }

    public list(): readonly ActNodeActionDescriptor[] { return [...this.entries.values()]; }
    public get(id: string): ActNodeActionDescriptor | undefined { return this.entries.get(id); }
}
