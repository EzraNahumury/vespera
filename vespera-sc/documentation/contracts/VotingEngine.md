# VotingEngine

Reputation-weighted, AI-confidence-routed withdrawal voting.
- `initVote` (AGENT_ROLE): <50% reject, 50-84% normal (60%/24h), >=85% fast (30%/12h).
- `castVote` (members, requester excluded; weight = score + 1).
- `finalize` (permissionless): quorum + majority -> Treasury.release + advance round.
