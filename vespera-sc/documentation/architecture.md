# Architecture

`GroupRegistry` is the factory and the source of truth: it deploys each `ArisanGroup`
and marks it registered. Shared contracts (`Treasury`, `ReputationRegistry`, `BadgeNFT`)
trust calls only from registered groups or the `VotingEngine`.

```
GroupRegistry ──deploys──> ArisanGroup ──deposit──> Treasury
      │                        │  request
      │                        ▼
      │                   VotingEngine ──release──> Treasury
      └── shared: ReputationRegistry, BadgeNFT, AgentRegistry
```
