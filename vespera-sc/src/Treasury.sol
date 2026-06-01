// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ITreasury} from "./interfaces/ITreasury.sol";
import {IGroupRegistry} from "./interfaces/IGroupRegistry.sol";

/// @title Treasury
/// @notice Multi-token escrow for ArisanGroup deposits (USDm / USDC / USDT). Funds are credited
///         per-group and can only be released by the VotingEngine after a vote passes. Uses
///         SafeERC20 (USDT returns no bool) and the CEI pattern + a reentrancy guard.
contract Treasury is ITreasury, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IGroupRegistry public groupRegistry;
    address public votingEngine;

    mapping(address token => bool) private _allowed;
    mapping(address group => mapping(address token => uint256)) private _balances;

    event TokenAllowed(address indexed token, bool allowed);
    event GroupRegistrySet(address indexed groupRegistry);
    event VotingEngineSet(address indexed votingEngine);
    event Deposited(address indexed group, address indexed token, address indexed from, uint256 amount);
    event Released(address indexed group, address indexed token, address indexed to, uint256 amount);

    error NotRegisteredGroup();
    error NotVotingEngine();
    error TokenNotAllowed();
    error InsufficientEscrow();
    error ZeroAddress();

    modifier onlyRegisteredGroup() {
        if (address(groupRegistry) == address(0) || !groupRegistry.isRegisteredGroup(msg.sender)) {
            revert NotRegisteredGroup();
        }
        _;
    }

    modifier onlyVotingEngine() {
        if (msg.sender != votingEngine) revert NotVotingEngine();
        _;
    }

    constructor(address admin) Ownable(admin) {}

    // --- Admin ---------------------------------------------------------------

    function allowToken(address token, bool allowed) external onlyOwner {
        if (token == address(0)) revert ZeroAddress();
        _allowed[token] = allowed;
        emit TokenAllowed(token, allowed);
    }

    function setGroupRegistry(address registry) external onlyOwner {
        if (registry == address(0)) revert ZeroAddress();
        groupRegistry = IGroupRegistry(registry);
        emit GroupRegistrySet(registry);
    }

    function setVotingEngine(address engine) external onlyOwner {
        if (engine == address(0)) revert ZeroAddress();
        votingEngine = engine;
        emit VotingEngineSet(engine);
    }

    // --- Escrow --------------------------------------------------------------

    /// @inheritdoc ITreasury
    function deposit(address token, address from, uint256 amount)
        external
        onlyRegisteredGroup
        nonReentrant
        returns (uint256 received)
    {
        if (!_allowed[token]) revert TokenNotAllowed();
        IERC20 t = IERC20(token);
        uint256 balBefore = t.balanceOf(address(this));
        t.safeTransferFrom(from, address(this), amount);
        // Credit the amount actually received (robust to fee-on-transfer tokens).
        received = t.balanceOf(address(this)) - balBefore;
        _balances[msg.sender][token] += received;
        emit Deposited(msg.sender, token, from, received);
    }

    /// @inheritdoc ITreasury
    function release(address group, address token, address to, uint256 amount)
        external
        onlyVotingEngine
        nonReentrant
    {
        uint256 bal = _balances[group][token];
        if (bal < amount) revert InsufficientEscrow();
        _balances[group][token] = bal - amount; // effects before interaction (CEI)
        IERC20(token).safeTransfer(to, amount);
        emit Released(group, token, to, amount);
    }

    // --- Views ---------------------------------------------------------------

    function balanceOf(address group, address token) external view returns (uint256) {
        return _balances[group][token];
    }

    function isAllowedToken(address token) external view returns (bool) {
        return _allowed[token];
    }
}
