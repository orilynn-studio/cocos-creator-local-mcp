# Review guide

Review changes in this order:

1. Does an action have a clear Creator-side behavior and input validation?
2. Is it correctly classified read-only, reversible write, or destructive?
3. Does the ActNode descriptor match the MCP adapter?
4. Does the change retain loopback-only transport and avoid secrets?
5. Do `npm run check` and a live Creator smoke test pass?

Do not infer authorization from MCP annotations. They are hints only.
