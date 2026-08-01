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
| Riverbed | `0x786a38bCa7880DED068F03B763aCEE7A703547ED` |
| PoolLow (3% APR) | `0xd5F89cD0227fEa485704BFe55CaC91FC29fEb5F7` |
| PoolMid (8% APR) | `0xF91fca1327867584865c38c095f053Ba2BaA33D2` |
| PoolHigh (15% APR) | `0xA6A3073AF927BCAb02d747B7a81b9d1c06f5FADb` |
| FXRP (Coston2) | `0x0b6A3645c240605887a5532109323A3E12273dc7` |

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

Built entirely within the hackathon window; no distribution or user testing yet beyond the team's own end-to-end verification on Coston2.
