# Install the 1.0 beta

The Cocos extension is distributed as a directory because Creator discovers
extensions from `<project>/extensions/<extension-name>/package.json`. The beta
release zip contains that directory already built; it does not require npm,
Node.js, or a build step on the user's machine.

## Creator extension

1. Download `agent-bridge-1.0.0-beta.1.zip` from the release assets.
2. Extract its `agent-bridge` directory into the target project's
   `extensions` directory.
3. Restart Cocos Creator and open **Panel → Agent Bridge**.
4. Copy the endpoint that matches the client:
   - `nwp://...` is the canonical Act Node address.
   - `http://127.0.0.1:47385/act` is the local HTTP overlay.
   - `http://127.0.0.1:47385/mcp` is Streamable HTTP MCP.

The extension binds to loopback only. Do not put the endpoint behind a LAN
proxy or expose it to the internet.

## Stdio MCP adapter

The repository includes a stdio adapter for clients that launch an MCP command
instead of connecting to Streamable HTTP. It is a workspace beta in this
release, not an independently published npm package yet; it depends on the
shared action-contract package being published first.

## What beta means

This release is for Creator 3.8.8 smoke testing. It supports the 17-action
catalog and keeps execution in Creator's native undo flow. Native NCP framing,
remote access, and an installer CLI are deliberately not included in this beta.
