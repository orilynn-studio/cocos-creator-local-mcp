# Architecture

Agent Bridge lets an AI agent operate an already-open Cocos Creator project.

```text
Agent client → ActNode or MCP adapter → loopback bridge → Creator extension → Editor.Message
```

The extension owns the Cocos-specific calls. The action catalog describes each
capability once. `packages/mcp-server` maps that catalog to MCP tools, while
the extension exposes the same catalog through `/act-node/actions` and
`/act-node/invoke` for an ActNode-capable controller.

The bridge is loopback-only. Read actions are separate from reversible scene
writes; destructive actions must be marked explicitly. Creator remains the
source of truth and owns its undo history.
