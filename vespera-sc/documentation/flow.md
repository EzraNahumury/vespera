# Lifecycle

1. Admin allow-lists deposit tokens (CELO auto per chain; stablecoins optional).
2. Creator creates a group (one token, fixed deposit, 5-15 members, round duration).
3. Creator invites wallet addresses; invitees `join()`.
4. Members approve the Treasury and deposit each round.
5. A member requests a withdrawal (amount + reason); rotation blocks repeat winners.
6. Off-chain agent scores confidence; `initVote` routes: <50% reject, normal (60%/24h), fast (>=85% -> 30%/12h).
7. Members cast reputation-weighted votes; requester excluded.
8. `finalize` pays the requester from escrow if passed, then advances the round.
