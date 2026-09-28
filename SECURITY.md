# Security policy

Agent Bridge binds only to loopback by default. Do not expose its HTTP endpoint
to a LAN or the public internet. Treat every agent request as untrusted input;
the host validates action names and arguments before calling Creator.

Report vulnerabilities privately to security@innolotus.com. Do not include
tokens, customer projects, or full scene data in a public report.
