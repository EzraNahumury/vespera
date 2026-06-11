// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ITreasury} from "./interfaces/ITreasury.sol";
import {IGroupRegistry} from "./interfaces/IGroupRegistry.sol";

/// @title Treasury
/// @notice In-game credit bank backed 1:1000 by native CELO (Voxel-style). Users deposit native
///         CELO and receive internal credits (1 CELO = `creditPerCelo` credits) into a PERSONAL
///         balance that exists independently of any group — they can top up before ever joining
///         one. Groups pull credits from a member's personal balance into a per-group escrow
///         ("payment"), and the VotingEngine releases that escrow back into the recipient's
///         personal balance on a passing vote. Credits are redeemed back to CELO via `withdraw`.
///         Every credit in circulation is fully covered by CELO held here, so withdrawals are
///         always solvent as long as nobody is paid out more credits than were ever deposited.
contract Treasury is ITreasury, Ownable, ReentrancyGuard {
    IGroupRegistry public groupRegistry;
    address public votingEngine;

    /// @notice Credits minted per 1 CELO deposited (default 1000). Owner-adjustable like Voxel.
    /// @dev Credits are an 18-decimal quantity, so 1 CELO (1e18 wei) -> 1000e18 credits ("1000.0").
    ///      deposit: credits = msg.value * creditPerCelo; withdraw: celo = credits / creditPerCelo.
    uint256 public creditPerCelo = 1000;

    /// @notice Personal credit balance per user (not tied to any group).
    mapping(address user => uint256) public creditBalance;
    /// @notice Escrowed credits held for a group (the rotating-savings pot).
    mapping(address group => uint256) public groupBalance;

    event CreditPerCeloSet(uint256 creditPerCelo);
    event GroupRegistrySet(address indexed groupRegistry);
    event VotingEngineSet(address indexed votingEngine);
    event Deposited(address indexed user, uint256 celoIn, uint256 creditsOut);
    event Withdrawn(address indexed user, uint256 creditsIn, uint256 celoOut);
    event LiquidityFunded(address indexed from, uint256 celoIn);
    event Paid(address indexed group, address indexed from, uint256 amount);
    event Released(address indexed group, address indexed to, uint256 amount);

    error NotRegisteredGroup();
    error NotVotingEngine();
    error InsufficientCredits();
    error InsufficientEscrow();
    error InsufficientLiquidity();
    error ZeroAmount();
    error ZeroAddress();
    error InvalidRate();
    error TransferFailed();

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

    function setCreditPerCelo(uint256 newCreditPerCelo) external onlyOwner {
        if (newCreditPerCelo == 0) revert InvalidRate();
        creditPerCelo = newCreditPerCelo;
        emit CreditPerCeloSet(newCreditPerCelo);
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

    /// @notice Seed extra CELO liquidity without minting credits (covers rounding/headroom).
    function fundLiquidity() external payable {
        if (msg.value == 0) revert ZeroAmount();
        emit LiquidityFunded(msg.sender, msg.value);
    }

    // --- Personal credits (open to everyone, no group required) --------------

    /// @inheritdoc ITreasury
    function deposit() external payable {
        if (msg.value == 0) revert ZeroAmount();
        uint256 credited = msg.value * creditPerCelo;
        creditBalance[msg.sender] += credited;
        emit Deposited(msg.sender, msg.value, credited);
    }

    /// @inheritdoc ITreasury
    function withdraw(uint256 credits) external nonReentrant {
        if (credits == 0) revert ZeroAmount();
        uint256 bal = creditBalance[msg.sender];
        if (credits > bal) revert InsufficientCredits();

        uint256 celoOut = credits / creditPerCelo;
        if (celoOut == 0) revert ZeroAmount(); // dust below 1 wei of CELO
        if (address(this).balance < celoOut) revert InsufficientLiquidity();

        creditBalance[msg.sender] = bal - credits; // effects (CEI)
        emit Withdrawn(msg.sender, credits, celoOut);

        (bool ok,) = payable(msg.sender).call{value: celoOut}("");
        if (!ok) revert TransferFailed();
    }

    // --- Group escrow (credits only, no token transfers) ---------------------

    /// @inheritdoc ITreasury
    function payFromCredits(address from, uint256 amount) external onlyRegisteredGroup nonReentrant {
        if (amount == 0) revert ZeroAmount();
        uint256 bal = creditBalance[from];
        if (bal < amount) revert InsufficientCredits();
        creditBalance[from] = bal - amount;
        groupBalance[msg.sender] += amount;
        emit Paid(msg.sender, from, amount);
    }

    /// @inheritdoc ITreasury
    function release(address group, address to, uint256 amount) external onlyVotingEngine nonReentrant {
        uint256 bal = groupBalance[group];
        if (bal < amount) revert InsufficientEscrow();
        groupBalance[group] = bal - amount; // effects before crediting (CEI)
        creditBalance[to] += amount;
        emit Released(group, to, amount);
    }

    // --- Views ---------------------------------------------------------------

    /// @inheritdoc ITreasury
    function balanceOf(address group) external view returns (uint256) {
        return groupBalance[group];
    }
}
