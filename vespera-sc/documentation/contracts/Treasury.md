# Treasury

Multi-token escrow per group. CEI + reentrancy guard, SafeERC20.
- `deposit(token, from, amount)` — registered groups; credits actual received amount.
- `release(group, token, to, amount)` — VotingEngine only.
- `allowToken` / `isAllowedToken` — admin-managed allowlist.
