# GroupRegistry

Factory + directory. Deploys each `ArisanGroup` and whitelists it.
- `createGroup(token, depositAmount, maxMembers, roundDuration, metadataURI)`.
- `isRegisteredGroup(addr)` — trusted by shared contracts.
- Validates token allowed, members in [5,15], amount/duration > 0.
