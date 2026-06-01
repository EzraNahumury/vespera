# AgentRegistry

Binds a user wallet to its AI agent config (delegated signer key + persona policy URI).
- `setAgent(agent, policyURI)` / `deactivate()` — caller manages own config.
- `isAgentFor(user, caller)` — read delegation. Used off-chain by the agents.
