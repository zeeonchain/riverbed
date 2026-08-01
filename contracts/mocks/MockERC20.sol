// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Mock FXRP", "mFXRP") {
        _mint(msg.sender, 1_000_000 ether);
    }

    /// @dev Test-only helper. Lets any caller mint tokens — used by
    /// MockKToken to simulate yield accruing into the pool, and by tests
    /// to fund accounts. Never deployed anywhere real; only exists so our
    /// mock yield pools have something to pay out.
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}