// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ICToken} from "../interfaces/ICToken.sol";

/// @notice Realistic mock of a Compound V2 / Kinetic-style kToken.
/// Exchange rate is derived from real tokens held by the pool, with a
/// pre-funded yield reserve that unlocks gradually over time — never
/// promising more than what's actually backed. supplyRatePerSecond()
/// reports a target APR for comparison/ranking in Riverbed's rebalance().
contract MockKToken is ERC20, ICToken {
    IERC20 public immutable underlying;
    uint256 public immutable targetRatePerSecondRay;
    uint256 private constant RAY = 1e27;
    uint256 private constant INITIAL_RATE = 1e18;
    uint256 public constant RELEASE_DURATION = 3 minutes;

    uint256 public reserve;
    uint256 public reserveStart;

    constructor(IERC20 _underlying, uint256 _aprBps) ERC20("Mock kToken", "mkTOKEN") {
        underlying = _underlying;
        targetRatePerSecondRay = (_aprBps * RAY) / 10_000 / 365 days;
    }

    /// @dev Exchange rate based on principal cash plus whatever portion
    /// of the reserve has unlocked so far. Can never exceed actual
    /// tokens held, since unlocked reserve <= reserve <= held balance.
    function exchangeRateStored() public view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return INITIAL_RATE;

        uint256 elapsed = block.timestamp > reserveStart ? block.timestamp - reserveStart : 0;
        if (elapsed > RELEASE_DURATION) elapsed = RELEASE_DURATION;
        uint256 unlockedReserve = reserve == 0 ? 0 : (reserve * elapsed) / RELEASE_DURATION;

        uint256 heldCash = underlying.balanceOf(address(this));
        uint256 principalCash = heldCash > reserve ? heldCash - reserve : 0;
        uint256 effectiveCash = principalCash + unlockedReserve;

        return (effectiveCash * 1e18) / supply;
    }

    /// @notice Funds this pool's yield reserve, which unlocks gradually
    /// over RELEASE_DURATION. Restarts the unlock window on each call.
    function fundReserve(uint256 amount) external {
        underlying.transferFrom(msg.sender, address(this), amount);
        reserve += amount;
        reserveStart = block.timestamp;
    }

    function mint(uint256 mintAmount) external returns (uint256) {
        // If this is the very first depositor into an empty pool, restart
        // the reserve's unlock clock so they don't instantly inherit any
        // yield that accrued before anyone had a real stake in the pool.
        if (totalSupply() == 0 && reserve > 0) {
            reserveStart = block.timestamp;
        }

        uint256 rate = exchangeRateStored();
        underlying.transferFrom(msg.sender, address(this), mintAmount);
        uint256 kTokens = (mintAmount * 1e18) / rate;
        _mint(msg.sender, kTokens);
        return 0;
    }

    function redeem(uint256 redeemTokens) external returns (uint256) {
        uint256 underlyingAmount = (redeemTokens * exchangeRateStored()) / 1e18;
        _burn(msg.sender, redeemTokens);
        uint256 cash = underlying.balanceOf(address(this));
        if (underlyingAmount > cash) underlyingAmount = cash;
        underlying.transfer(msg.sender, underlyingAmount);
        return 0;
    }

    function redeemUnderlying(uint256 redeemAmount) external returns (uint256) {
        uint256 kTokens = (redeemAmount * 1e18) / exchangeRateStored();
        _burn(msg.sender, kTokens);
        uint256 cash = underlying.balanceOf(address(this));
        uint256 payout = redeemAmount > cash ? cash : redeemAmount;
        underlying.transfer(msg.sender, payout);
        return 0;
    }

    function balanceOfUnderlying(address account) external returns (uint256) {
        return (balanceOf(account) * exchangeRateStored()) / 1e18;
    }

    function supplyRatePerSecond() external view returns (uint256) {
        return targetRatePerSecondRay / 1e9;
    }
}