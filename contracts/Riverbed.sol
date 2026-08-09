// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ContractRegistry} from "@flarenetwork/flare-periphery-contracts/coston2/ContractRegistry.sol";
import {TestFtsoV2Interface} from "@flarenetwork/flare-periphery-contracts/coston2/TestFtsoV2Interface.sol";
import {ICToken} from "./interfaces/ICToken.sol";

/// @title Riverbed
/// @notice Deposit FXRP; funds flow to whichever registered pool currently
/// offers the best real yield. Owner-triggered rebalance, automatic pool
/// selection. Live FXRP/USD valuation via Flare's FTSOv2.
contract Riverbed is Ownable {
    IERC20 public immutable fxrp;

    mapping(address => uint256) public shares;
    uint256 public totalShares;

    address[] public pools;
    address public activePool; // which pool currently holds the funds (address(0) = idle cash)

    event Deposited(address indexed user, uint256 amount, uint256 sharesMinted);
    event Withdrawn(address indexed user, uint256 amount, uint256 sharesBurned);
    event PoolAdded(address indexed pool);
    event Rebalanced(address indexed fromPool, address indexed toPool, uint256 amountMoved);

    constructor(address _fxrp) Ownable(msg.sender) {
        fxrp = IERC20(_fxrp);
    }

    // ── admin ──────────────────────────────────────────────────────────

    function addPool(address pool) external onlyOwner {
        pools.push(pool);
        emit PoolAdded(pool);
    }

    /// @notice Compares every registered pool's real-time supply rate and
    /// moves all funds to the best one. Safe to call even if already optimal
    /// (no-op in that case beyond a small gas cost). Deposits also trigger
    /// this automatically, so this is mainly useful if a better pool
    /// appears while funds are already sitting somewhere.
    function rebalance() external onlyOwner {
        _routeIdleFunds();
    }

    /// @dev Moves any idle FXRP (plus funds in a now-suboptimal pool) into
    /// whichever registered pool currently offers the best rate.
    function _routeIdleFunds() internal {
        address best = _bestPool();
        if (best == address(0)) return; // no pools registered yet

        if (activePool != address(0) && best != activePool) {
            uint256 stuck = ICToken(activePool).balanceOfUnderlying(address(this));
            if (stuck > 0) {
                ICToken(activePool).redeemUnderlying(stuck);
            }
        }

        uint256 idle = fxrp.balanceOf(address(this));
        if (idle > 0) {
            fxrp.approve(best, idle);
            ICToken(best).mint(idle);
        }

        if (best != activePool) {
            emit Rebalanced(activePool, best, idle);
            activePool = best;
        }
    }

    function _bestPool() internal view returns (address) {
        address best = address(0);
        uint256 bestRate = 0;
        for (uint256 i = 0; i < pools.length; i++) {
            uint256 rate = ICToken(pools[i]).supplyRatePerSecond();
            if (rate > bestRate) {
                bestRate = rate;
                best = pools[i];
            }
        }
        return best;
    }

    // ── user actions ───────────────────────────────────────────────────

    function deposit(uint256 amount) external {
        require(amount > 0, "amount must be > 0");
        uint256 totalBefore = totalValue();
        fxrp.transferFrom(msg.sender, address(this), amount);

        uint256 newShares = totalShares == 0
            ? amount
            : (amount * totalShares) / totalBefore;

        shares[msg.sender] += newShares;
        totalShares += newShares;

        _routeIdleFunds();

        emit Deposited(msg.sender, amount, newShares);
    }

    function withdraw(uint256 shareAmount) external {
        require(shareAmount > 0, "amount must be > 0");
        require(shares[msg.sender] >= shareAmount, "insufficient shares");

        uint256 amount = (shareAmount * totalValue()) / totalShares;

        shares[msg.sender] -= shareAmount;
        totalShares -= shareAmount;

        if (activePool != address(0)) {
            if (totalShares == 0) {
                // Last depositor leaving — fully drain the pool so its
                // own accounting (kTokens/reserve) resets cleanly too,
                // rather than leaving dust that desyncs Riverbed's and
                // the pool's views of "empty."
                uint256 stuck = ICToken(activePool).balanceOfUnderlying(address(this));
                if (stuck > 0) {
                    ICToken(activePool).redeemUnderlying(stuck);
                }
            } else {
                uint256 idle = fxrp.balanceOf(address(this));
                if (amount > idle) {
                    ICToken(activePool).redeemUnderlying(amount - idle);
                }
            }
        }

        fxrp.transfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount, shareAmount);
    }

    // ── views ──────────────────────────────────────────────────────────

    function totalValue() public view returns (uint256) {
        uint256 idle = fxrp.balanceOf(address(this));
        if (activePool == address(0)) return idle;
        // balanceOfUnderlying mutates state on the real protocol, so we
        // approximate with exchangeRateStored for a view-safe read here.
        uint256 kBalance = IERC20(activePool).balanceOf(address(this));
        uint256 rate = ICToken(activePool).exchangeRateStored();
        return idle + (kBalance * rate) / 1e18;
    }

    function balanceOf(address user) external view returns (uint256) {
        if (totalShares == 0) return 0;
        return (shares[user] * totalValue()) / totalShares;
    }

    function getXrpUsdPrice() public view returns (uint256 price, int8 decimals, uint64 timestamp) {
        TestFtsoV2Interface ftsoV2 = ContractRegistry.getTestFtsoV2();
        bytes21 feedId = 0x015852502f55534400000000000000000000000000; // "XRP/USD"
        return ftsoV2.getFeedById(feedId);
    }

    function getVaultValueUsd() external view returns (uint256 valueUsd, int8 decimals) {
        (uint256 price, int8 priceDecimals, ) = getXrpUsdPrice();
        valueUsd = (totalValue() * price) / (10 ** 18);
        decimals = priceDecimals;
    }
}