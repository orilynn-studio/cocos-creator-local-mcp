# ADR 0003: Ship the Creator extension as a self-contained release artifact

Status: Accepted\n\nDate: 2026-09-30

## Context

Creator has no proprietary extension archive format. It discovers an extension
directory from its manifest. The development package currently consumes the
shared action contract through a workspace dependency, which is correct for
development but unsuitable for a user extracting a release.

## Decision

The beta release is a zip containing `agent-bridge/`, built from the extension
package. Its manifest retains only Creator-relevant fields and its bundled
`dist/main.js` contains runtime JavaScript dependencies. The release includes
Apache-2.0 and NOTICE files. The release artifact does not run `npm install`.

## Consequences

- Users can install without Node.js or private registry credentials.
- Creator sees the same directory shape it loads from a project extension.
- npm publication is deferred until contract packages use publishable semver
  dependencies rather than workspace file references.
- The packaging script is a reproducible boundary between developer workspace
  state and distributable extension contents.
