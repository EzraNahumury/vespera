# Deposit tokens

One token per group, fixed at creation, must be Treasury-allowed.

- Stablecoins: USDm / USDC / USDT (set addresses at deploy).
- CELO: native coin via its canonical ERC-20 adapter
  (0x471EcE3750Da237f93B8E339c536989b8978a438 mainnet). Native and ERC-20 balances are
  unified, so deposits use approve + transferFrom like any token. Auto-allowed per chain.

SafeERC20 is used everywhere (USDT returns no bool).
