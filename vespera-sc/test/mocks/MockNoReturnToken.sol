// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @notice USDT-style token whose transfer/transferFrom return NO value. Used to prove the
///         Treasury's SafeERC20 usage works with non-standard ERC-20s.
contract MockNoReturnToken {
    string public name = "Mock Tether";
    string public symbol = "USDT";
    uint8 public decimals = 6;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    // NOTE: intentionally no return value (USDT-like).
    function transfer(address to, uint256 amount) external {
        _transfer(msg.sender, to, amount);
    }

    // NOTE: intentionally no return value (USDT-like).
    function transferFrom(address from, address to, uint256 amount) external {
        uint256 a = allowance[from][msg.sender];
        require(a >= amount, "allowance");
        if (a != type(uint256).max) allowance[from][msg.sender] = a - amount;
        _transfer(from, to, amount);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(balanceOf[from] >= amount, "balance");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
    }
}
