# Security notes

- CEI + reentrancy guard on `Treasury.release` and `VotingEngine.finalize`.
- SafeERC20 for non-standard tokens (USDT).
- Requester excluded from their own vote and eligible weight.
- BadgeNFT is soulbound (transfers revert).
- Admin/agent key should be rotated to dedicated wallets for production.
