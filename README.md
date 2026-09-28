# Cocos Creator Local MCP

Agent Bridge gives local AI agents a controlled path into an open Cocos Creator project. It exposes one Cocos action catalog through two interfaces:

- **ActNode** — native, transport-neutral action descriptions and loopback catalog/invocation endpoints.
- **MCP** — an adapter for Codex, Claude Code, Cursor, and other compatible clients.

Start at [START-HERE.md](START-HERE.md). The architecture and Ivy compatibility limit are in [ADR 0001](docs/04-decisions/0001-dual-action-interfaces.md).

## Status

This is an early Cocos Creator 3.8.8 prototype. The TypeScript implementation uses Ivy ActNode protocol concepts; upstream TypeScript SDK support is scaffold only, so this repository does not claim NPS transport conformance yet.

## License

Copyright 2026 InnoLotus Pty Ltd. Licensed under [Apache-2.0](LICENSE). See [NOTICE](NOTICE) for Cocos Creator compatibility and redistribution scope.
