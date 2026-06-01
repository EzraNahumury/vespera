.PHONY: build test fmt snapshot deploy-alfajores deploy-mainnet

build:; forge build
test:; forge test
fmt:; forge fmt
snapshot:; forge snapshot
deploy-alfajores:; forge script script/Deploy.s.sol:Deploy --rpc-url https://alfajores-forno.celo-testnet.org --broadcast
deploy-mainnet:; forge script script/Deploy.s.sol:Deploy --rpc-url https://forno.celo.org --broadcast
