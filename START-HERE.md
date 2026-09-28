# Start here

1. Read the [overview](docs/00-overview/architecture.md).
2. Read [the action contract](docs/03-reference/action-contract.md).
3. Install dependencies with `npm install`, then run `npm run check`.
4. Package `packages/cocos-extension` and install it in Cocos Creator.
5. Configure `packages/mcp-server` in an MCP-compatible client.

`packages/act-node` is the native action description. MCP is an adapter over
the same catalog; it is not the authority for action safety.
