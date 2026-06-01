# BadgeNFT

Soulbound ERC-721 attestations (transfers revert via `_update`).
- `mint(to, badgeType)` — MINTER_ROLE (ReputationRegistry) or any registered group (Founder).
- One badge per (account, type). 5 types.
