# Riverbed

**An automated yield router for FXRP on Flare.**

Deposit FXRP into a single vault; Riverbed continuously compares real yield rates across connected lending pools and automatically routes funds to whichever one currently pays the most — no manual switching, no missed yield sitting in the wrong place.

🔗 **Live app:** https://riverbed-ten.vercel.app/
📦 **Deployed on:** Flare Coston2 testnet
🏆 **Flare Summer Signal — Bounty 1: Interoperable Asset Products**

## Target user

FXRP holders on Flare who want passive, optimized yield without manually monitoring and switching between lending markets themselves — the same problem yield aggregators like Yearn solve for ERC-20 assets, applied to Flare's FAsset ecosystem.

---

## What it does

- Deposit FXRP, receive shares representing your portion of the vault (standard vault accounting)
- Riverbed automatically routes new deposits to whichever registered pool currently offers the best real rate
- Live FXRP/USD valuation via Flare's FTSOv2 oracle
- Withdraw anytime for FXRP — principal plus whatever yield accrued while it was working

## How it uses Flare

- **FAssets (FXRP)** — Riverbed's core asset is FXRP, Flare's trustless wrapped XRP. The product exists specifically to give FXRP somewhere productive to go.
- **FTSOv2** — live FXRP/USD price feed integrated directly into the contract (`getXrpUsdPrice()` / `getVaultValueUsd()`).
- Built against an interface (`ICToken.sol`) that exactly matches Kinetic's real Compound V2-style lending market on Flare Mainnet — so Riverbed's routing logic requires no changes to work against the real market once deployed there.

## Why a mock pool on testnet

Kinetic's real FXRP lending market exists on **Flare Mainnet only**, not Coston2. Since testnet FXRP has no real lending market to route into, a realistic mock pool (`MockKToken.sol`) was built matching Kinetic's real interface exactly — same function signatures, same accounting model — so the routing logic is a drop-in fit for the real contracts. This is documented transparently rather than hidden; see `contracts/mocks/MockKToken.sol` for the full reasoning in comments.

## Contracts (Coston2 testnet)

| Contract | Address |
|---|---|
| Riverbed | `0x5a51CcA24c57574B2f59BFDbb7851f931fAf6caA` |
| PoolLow (3% APR) | `0x230B9cf57ED822354E8847192D62F006CF1D9291` |
| PoolMid (8% APR) | `0x37e5ba65f201d8A268E99851A078209F25BB6B67` |
| PoolHigh (15% APR) | `0x849B05757A5525610aE9836597a27Ce481389336` |
| FXRP (Coston2) | `0x0b6A3645c240605887a5532109323A3E12273dc7` |

## A note on testing the demo

Each pool's yield reserve unlocks gradually over 3 minutes once funded, then stays flat until topped up again — this mirrors how a real lending market's interest income arrives continuously, without needing an always-on off-chain process for a testnet demo. Since Kinetic's real interest-bearing market only exists on Flare Mainnet, this testnet demo periodically re-funds each pool's reserve (`fundReserve()`) to keep the accrual mechanism visibly running for testers. On mainnet, this would happen automatically and continuously via real borrower activity — no manual step needed.

Depending on when you test relative to when the reserve was last funded, you may see one of three things, all expected and correct:
- **Gradual growth** — if you deposit within the 3-minute window after a funding, your position's value will visibly climb toward the full unlocked amount.
- **An instant jump to the full amount** — if the reserve had already been funded and fully unlocked (its 3-minute window already elapsed) before you deposited, your position starts at the full matured value immediately rather than climbing. This is correct: the reserve's own accrual already ran its course; a new depositor after that point is simply buying in at the current, fully-settled rate — the same way a real lending market's rate reflects however much interest has already accrued, whoever joins.
- **Flat, unchanging value at exactly 1:1** — if the reserve has already been fully unlocked and claimed by an earlier depositor's withdrawal, there's nothing left to grow until the reserve is topped up again.

## Project structure

```
contracts/          Solidity source (Riverbed.sol, mocks, interfaces)
test/                Foundry + node:test test suite
scripts/             Deployment/interaction scripts
ignition/            Hardhat Ignition deployment modules
frontend/            React + Vite + Tailwind app (deposit/withdraw UI, live on-chain data)
```

## Running locally

**Contracts:**
```shell
npm install
npx hardhat test
```

**Frontend:**
```shell
cd frontend
npm install
npm run dev
```

## What was newly built during the hackathon

Everything in this repo was built from zero during the Flare Summer Signal window:

- `Riverbed.sol` — multi-pool, shares-based yield vault with automatic (on-deposit) and owner-triggered rebalancing to the best-rate pool
- FTSOv2 price integration for live FXRP/USD valuation
- `ICToken.sol` — a Compound V2 / Kinetic-compatible interface, so the routing logic works identically against the real Kinetic contracts once deployed on Flare Mainnet
- `MockKToken.sol` — a realistic mock lending pool for testnet demonstration, including bounded automatic yield accrual and a fairness fix ensuring a pool's first depositor doesn't inherit unearned yield
- Full test suite: deposit, rebalance, re-rebalance when a better pool appears, withdrawal, and accrual behavior
- Complete frontend — wallet connection, live on-chain data throughout (position, pool rates, active pool), working deposit/withdraw flows with real transaction handling and error states

## Roadmap

1. Deploy against the real Kinetic FXRP market on Flare Mainnet — no logic changes required, the interface already matches
2. Add more pool integrations as additional FXRP lending markets launch on Flare
3. Contract-level circuit breaker for pool liquidity risk
4. Delivery/performance verification layer for pool selection beyond raw rate comparison

## Traction

Built entirely within the hackathon window. 2 people tested the live app on Coston2 testnet ahead of submission — feedback noted the deposit/withdraw flow was easy to interact with, and the loading screen and landing page design stood out positively.