// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ICToken} from "../interfaces/ICToken.sol";

/// @notice Realistic mock of a Compound V2 / Kinetic-style kToken.
/// Real depositor principal and bonus yield reserve are tracked as two
/// separate, always-accurate running totals (updated symmetrically on
/// every mint/redeem), rather than inferred by subtracting one from
/// total cash. This avoids state ever drifting out of sync with reality.
contract MockKToken is ERC20, ICToken {
    IERC20 public immutable underlying;
    uint256 public immutable targetRatePerSecondRay;
    uint256 private constant RAY = 1e27;
    uint256 private constant INITIAL_RATE = 1e18;
    uint256 public constant RELEASE_DURATION = 3 minutes;

    uint256 public principalCash;   // sum of real depositor money currently in the pool
    uint256 public reserveFundedTotal; // cumulative bonus yield ever funded (only grows)
    uint256 public reserveStart;       // timestamp of the first-ever fundReserve call

    constructor(IERC20 _underlying, uint256 _aprBps) ERC20("Mock kToken", "mkTOKEN") {
        underlying = _underlying;
        targetRatePerSecondRay = (_aprBps * RAY) / 10_000 / 365 days;
    }

    /// @dev Blends real depositor principal with however much of the
    /// bonus reserve has unlocked so far. The unlocked portion can never
    /// exceed actual surplus cash sitting in the pool beyond principal,
    /// so this can never promise more than the pool physically holds.
    function exchangeRateStored() public view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return INITIAL_RATE; // always safe: no free money possible for a first depositor

        uint256 cash = underlying.balanceOf(address(this));
        uint256 surplus = cash > principalCash ? cash - principalCash : 0;

        uint256 unlockedReserve = 0;
        if (reserveFundedTotal > 0 && reserveStart > 0) {
            uint256 elapsed = block.timestamp > reserveStart ? block.timestamp - reserveStart : 0;
            if (elapsed > RELEASE_DURATION) elapsed = RELEASE_DURATION;
            unlockedReserve = (reserveFundedTotal * elapsed) / RELEASE_DURATION;
            if (unlockedReserve > surplus) unlockedReserve = surplus; // never claim more than actually present
        }

        uint256 effectiveCash = principalCash + unlockedReserve;
        return (effectiveCash * 1e18) / supply;
    }

    /// @notice Funds the pool's bonus yield reserve. The unlock clock
    /// starts on the first-ever call and never resets afterward.
    function fundReserve(uint256 amount) external {
        underlying.transferFrom(msg.sender, address(this), amount);
        reserveFundedTotal += amount;
        if (reserveStart == 0) reserveStart = block.timestamp;
    }

    function mint(uint256 mintAmount) external returns (uint256) {
        // First depositor of this "generation" — restart the unlock
        // clock right now, so they don't inherit progress that happened
        // before they had any stake in the pool.
        if (totalSupply() == 0 && reserveFundedTotal > 0) {
            reserveStart = block.timestamp;
        }

        uint256 rate = exchangeRateStored();
        underlying.transferFrom(msg.sender, address(this), mintAmount);
        uint256 kTokens = (mintAmount * 1e18) / rate;
        _mint(msg.sender, kTokens);
        principalCash += mintAmount;
        return 0;
    }

    function redeem(uint256 redeemTokens) external returns (uint256) {
        uint256 underlyingAmount = (redeemTokens * exchangeRateStored()) / 1e18;
        _burn(msg.sender, redeemTokens);
        uint256 cash = underlying.balanceOf(address(this));
        if (underlyingAmount > cash) underlyingAmount = cash;
        principalCash = underlyingAmount >= principalCash ? 0 : principalCash - underlyingAmount;
        underlying.transfer(msg.sender, underlyingAmount);
        // Pool is fully empty again — clear reserve bookkeeping so the
        // next generation of depositors paces correctly against only
        // what's newly funded for them, not stale historical totals.
        if (totalSupply() == 0) {
            reserveFundedTotal = 0;
            reserveStart = 0;
        }
        return 0;
    }

    function redeemUnderlying(uint256 redeemAmount) external returns (uint256) {
        uint256 kTokens = (redeemAmount * 1e18) / exchangeRateStored();
        _burn(msg.sender, kTokens);
        uint256 cash = underlying.balanceOf(address(this));
        uint256 payout = redeemAmount > cash ? cash : redeemAmount;
        principalCash = payout >= principalCash ? 0 : principalCash - payout;
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