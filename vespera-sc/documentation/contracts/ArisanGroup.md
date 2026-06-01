# ArisanGroup

Per-group core: invite-gated members, fixed-amount deposit rounds, withdrawal requests,
payout + rotation.
- `invite`/`inviteBatch` (creator), `join` (invitee), `deposit`, `requestWithdrawal`.
- VotingEngine callbacks: `markVoting` / `markExecuted` / `markRejected`.
- One deposit token per group; rotation enforced per cycle.
