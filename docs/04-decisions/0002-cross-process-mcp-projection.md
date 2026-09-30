# ADR 0002: Keep the Cocos Host and stdio MCP server as separate processes

Status: Accepted

## Context

Cocos Creator loads the extension in its Electron process. Codex launches the
MCP server as a separate stdio process. The Ivy SDK offers an in-process
`McpActNodeHostBridge`, but using that class across this process boundary would
require moving the Creator Host out of the extension or exposing an ungoverned
remote object.

## Decision

The Creator extension remains the only process that owns the Ivy Act Node Host
and its governed action registrations. It exposes a loopback-only Act Node HTTP
transport. The stdio MCP process is an adapter: it projects the same action
contract into MCP tools and invokes the Host only through that transport.

`@innolotus/ivy-act-node-bridge-mcp` is reserved for a future deployment where
the MCP transport and Host deliberately run in the same process.

## Consequences

- Creator-specific authority stays next to `Editor.Message`.
- MCP annotations are discovery hints, never authorization evidence.
- The HTTP endpoint is a security boundary and must preserve Host diagnostics,
  caller evidence and JSON-only values.
- A shared action catalog remains required; transport adapters must not invent
  independent action definitions.
