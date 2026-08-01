// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @notice Minimal Compound V2-style interface, matching Kinetic's Kii tokens
interface ICToken {
    function mint(uint256 mintAmount) external returns (uint256);
    function redeem(uint256 redeemTokens) external returns (uint256);
    function redeemUnderlying(uint256 redeemAmount) external returns (uint256);
    function balanceOfUnderlying(address account) external returns (uint256);
    function exchangeRateStored() external view returns (uint256);
    function supplyRatePerSecond() external view returns (uint256);
}