# Tests

25 Foundry tests in `test/Vespera.t.sol`:
- Group creation, invite gating, founder badge, full membership.
- Deposit escrow + scoring.
- Voting: fast-track, normal, auto-reject, guards, finalize timing.
- Rotation across cycles.
- Tokens: USDm, USDT (no-return), CELO.
- Access control on all privileged entrypoints.
- Reputation badge (Consistent Payer) and soulbound transfer block.

Run: `forge test`.
