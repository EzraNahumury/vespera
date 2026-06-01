# Security Policy

## Trust assumptions
- The deployer holds admin/owner over every contract. For production, move admin to a
  secure wallet and grant `AGENT_ROLE` to a dedicated agent key.
- `initVote` confidence is an off-chain trusted input gated by `AGENT_ROLE`.
- `block.timestamp` drives vote/round deadlines (drift immaterial vs 12h/24h windows).

## Reporting
Report vulnerabilities privately to the maintainer before public disclosure.
