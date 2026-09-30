# Cocos Creator Agent Bridge

Agent Bridge gives local AI agents a controlled path into an open Cocos Creator project. It exposes one Cocos action catalog through two interfaces:

- **ActNode** — native, transport-neutral action descriptions and loopback catalog/invocation endpoints.
- **MCP** — an adapter for Codex, Claude Code, Cursor, and other compatible clients.

Start at [START-HERE.md](START-HERE.md). The architecture and Ivy compatibility limit are in [ADR 0001](docs/04-decisions/0001-dual-action-interfaces.md).

## 1.0.0-beta.1

The beta supports Cocos Creator 3.8.8 with one governed catalog of 17 actions,
available through loopback Act HTTP and MCP Streamable HTTP. The separately
shipped stdio MCP adapter invokes the same Creator-side Host over loopback.

This is a beta: the bridge is intentionally local-only, and its native NCP
transport remains future work. See [the beta installation guide](docs/02-guides/install-beta.md).

## License

Copyright 2026 InnoLotus Pty Ltd. Licensed under [Apache-2.0](LICENSE). See [NOTICE](NOTICE) for Cocos Creator compatibility and redistribution scope.
