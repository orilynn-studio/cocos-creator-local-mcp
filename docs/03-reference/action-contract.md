# Action contract

The native interface is JSON over loopback HTTP:

- `GET /act-node/actions` returns `ActNodeActionDescriptor[]`.
- `POST /act-node/invoke` accepts `{ "id": string, "arguments": object }`.

MCP calls map to the same `id` and arguments. Hints are discovery metadata,
not authorization. The current TypeScript implementation follows the Ivy
ActNode protocol shapes, but does **not** claim NPS transport conformance: the
upstream TypeScript SDK is scaffold-only at this time.
