// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @title AgentRegistry
/// @notice Binds a user wallet to its AI agent configuration (delegated signer key + persona
///         policy URI). Used off-chain by the Requester/Reviewer agents; on-chain it lets a
///         delegated agent key act for a user where contracts choose to honour it.
contract AgentRegistry {
    struct AgentConfig {
        address agent; // delegated signer key the AI backend controls for this user
        string policyURI; // IPFS pointer to the voting persona / policy
        bool active;
        uint64 updatedAt;
    }

    mapping(address user => AgentConfig) private _configs;

    event AgentConfigured(address indexed user, address indexed agent, string policyURI);
    event AgentDeactivated(address indexed user);

    error ZeroAgent();

    /// @notice Set (or update) the caller's agent configuration.
    function setAgent(address agent, string calldata policyURI) external {
        if (agent == address(0)) revert ZeroAgent();
        _configs[msg.sender] =
            AgentConfig({agent: agent, policyURI: policyURI, active: true, updatedAt: uint64(block.timestamp)});
        emit AgentConfigured(msg.sender, agent, policyURI);
    }

    /// @notice Deactivate the caller's agent (votes/actions on their behalf stop being honoured).
    function deactivate() external {
        _configs[msg.sender].active = false;
        _configs[msg.sender].updatedAt = uint64(block.timestamp);
        emit AgentDeactivated(msg.sender);
    }

    function getAgent(address user) external view returns (AgentConfig memory) {
        return _configs[user];
    }

    /// @notice Whether `caller` is the active delegated agent for `user`.
    function isAgentFor(address user, address caller) external view returns (bool) {
        AgentConfig storage c = _configs[user];
        return c.active && c.agent == caller;
    }
}
