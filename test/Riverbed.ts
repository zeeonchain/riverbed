import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("Riverbed", async function () {
  const { viem } = await network.create();
  const [owner, user] = await viem.getWalletClients();

  async function deployRiverbed() {
    const token = await viem.deployContract("MockERC20");
    const riverbed = await viem.deployContract("Riverbed", [token.address]);

    // two pools, different APRs: 300 bps (3%) and 800 bps (8%)
    const poolLow = await viem.deployContract("MockKToken", [token.address, 300n]);
    const poolHigh = await viem.deployContract("MockKToken", [token.address, 800n]);

    await riverbed.write.addPool([poolLow.address]);
    await riverbed.write.addPool([poolHigh.address]);

    await token.write.transfer([user.account.address, 1000n * 10n ** 18n]);
    const userToken = await viem.getContractAt("MockERC20", token.address, {
      client: { wallet: user },
    });
    const userRiverbed = await viem.getContractAt("Riverbed", riverbed.address, {
      client: { wallet: user },
    });

    return { token, riverbed, poolLow, poolHigh, userToken, userRiverbed };
  }

  it("lets a user deposit and tracks their share of the vault", async function () {
    const { userToken, userRiverbed, riverbed } = await deployRiverbed();

    await userToken.write.approve([riverbed.address, 300n * 10n ** 18n]);
    await userRiverbed.write.deposit([300n * 10n ** 18n]);

    const balance = await riverbed.read.balanceOf([user.account.address]);
    assert.equal(balance, 300n * 10n ** 18n);
  });

  it("rebalance() routes idle funds into the higher-yield pool", async function () {
    const { userToken, userRiverbed, riverbed, poolHigh } = await deployRiverbed();

    await userToken.write.approve([riverbed.address, 300n * 10n ** 18n]);
    await userRiverbed.write.deposit([300n * 10n ** 18n]);

    await riverbed.write.rebalance();

    const activePool = await riverbed.read.activePool();
    assert.equal(activePool.toLowerCase(), poolHigh.address.toLowerCase());
  });

  it("moves funds again if a different pool becomes better after re-adding", async function () {
    const { userToken, userRiverbed, riverbed, poolLow, poolHigh, token } = await deployRiverbed();

    await userToken.write.approve([riverbed.address, 300n * 10n ** 18n]);
    await userRiverbed.write.deposit([300n * 10n ** 18n]);
    await riverbed.write.rebalance();

    let activePool = await riverbed.read.activePool();
    assert.equal(activePool.toLowerCase(), poolHigh.address.toLowerCase());

    // deploy a new, even-better pool and add it
    const poolBest = await viem.deployContract("MockKToken", [token.address, 1500n]);
    await riverbed.write.addPool([poolBest.address]);
    await riverbed.write.rebalance();

    activePool = await riverbed.read.activePool();
    assert.equal(activePool.toLowerCase(), poolBest.address.toLowerCase());
  });

  it("lets a user withdraw their funds back out after being in a pool", async function () {
    const { userToken, userRiverbed, riverbed } = await deployRiverbed();

    await userToken.write.approve([riverbed.address, 300n * 10n ** 18n]);
    await userRiverbed.write.deposit([300n * 10n ** 18n]);
    await riverbed.write.rebalance();

    const sharesBefore = await riverbed.read.shares([user.account.address]);
    await userRiverbed.write.withdraw([sharesBefore]);

    const remaining = await riverbed.read.balanceOf([user.account.address]);
    assert.equal(remaining, 0n);
  });
});