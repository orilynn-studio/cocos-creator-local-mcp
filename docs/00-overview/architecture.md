# Architecture

Agent Bridge lets an AI agent operate an already-open Cocos Creator project.

```text
Agent client → ActNode HTTP or stdio MCP adapter → loopback bridge → Ivy Host + Governance → Creator extension → Editor.Message
```

The extension owns the Cocos-specific calls and the only executable Ivy Host.
`packages/mcp-server` is a separate-process MCP adapter; it cannot bypass the
Host through an in-memory reference. See ADR 0002 for the process-boundary
rationale.

The bridge is loopback-only. Read actions are separate from reversible scene
writes; destructive actions must be marked explicitly. Creator remains the
source of truth and owns its undo history.
