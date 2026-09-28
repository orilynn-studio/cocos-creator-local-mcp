# ADR 0001: ActNode is native; MCP is an adapter

Status: Accepted — 2026-09-28

## Context

Agent Bridge must work with Ivy-oriented controllers and generic MCP clients.

## Decision

Describe Cocos actions once as ActNode descriptors. Expose a local ActNode
catalog/invocation endpoint and adapt the same descriptors to MCP tools.

## Consequences

MCP annotations cannot authorize a call. The bridge keeps loopback-only
transport and validates requests at the Creator boundary. Full NPS transport
will be added only when a maintained TypeScript Ivy SDK is available or the
project explicitly implements and conforms to it.
