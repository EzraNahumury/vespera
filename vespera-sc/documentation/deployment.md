# Deployment

## Celo mainnet (chainId 42220) — in-game credit model (native CELO @ 1:1000)
| Contract | Address |
|----------|---------|
| Treasury | 0xe0F543010FbAc613a6550E19Da6a680173Cf9009 |
| GroupRegistry | 0xD5D1a4713B8774783CFe33Bb2c68655Dc53036f0 |
| VotingEngine | 0x760674315E3c1eA8665a756155C6602e547E788A |
| ReputationRegistry | 0x7f4a0C69c3699e7d89bdB527f9e0048Da137b6aF |
| BadgeNFT | 0x1995408F84a41Bc81Ec748b6b0718e30f65A5fB2 |
| AgentRegistry | 0x0f4afA3e8297e817B3Aa638cd592a46961ac7228 |

Deposits are native CELO converted to internal credits (`creditPerCelo = 1000`); no
ERC-20 deposit tokens. Admin/agent: 0x34b42a1BD9398A0c95812c09F55AD9Dae3d17F08.
Deployed 2026-06-11. See `deployments/celo-mainnet.json`.

### Previous deployment (ERC-20 model, deprecated)
| Contract | Address |
|----------|---------|
| GroupRegistry | 0x493613949d63b63b02A58Ee899e9c6cd647Ae86b |
| AgentRegistry | 0x67aF4795C9C76677F252d1b60DA7b240DB3A7A10 |
| BadgeNFT | 0x4d5AcB5cDE12C0657C0D8aA4c3C8004196dB8410 |
| ReputationRegistry | 0xd6EE8f307B9564A6E0EA8Aa91b5A74Cb40a3F521 |
| Treasury | 0x4D84DD953FCdecfD54eA50e4ce6Ea809D9f9DAbd |
| VotingEngine | 0xCa8C94Fb21C5d6b8f786e6d549dAb2a8Fe2f07f6 |
