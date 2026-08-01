import { network } from "hardhat";
import { test } from "node:test";
import { parseUnits } from "viem";

test("accrual", async (t) => {
  const { viem, networkHelpers } = await network.connect();
  const [owner, user] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  const token = await viem.deployContract("MockERC20");
  const pool = await viem.deployContract("MockKToken", [token.address, 1500n]);

  await token.write.mint([user.account.address, parseUnits("10", 18)]);
  await token.write.approve([pool.address, parseUnits("10", 18)], { account: user.account });
  await pool.write.mint([parseUnits("1", 18)], { account: user.account });

  await token.write.mint([owner.account.address, parseUnits("1", 18)]);
  await token.write.approve([pool.address, parseUnits("1", 18)], { account: owner.account });
  await pool.write.fundReserve([parseUnits("0.3", 18)], { account: owner.account });

  const rateAtStart = await pool.read.exchangeRateStored();
  console.log("Rate at t=0:", rateAtStart);

  await networkHelpers.time.increase(900); // 15 minutes, half the 30-minute window
  const rateHalfway = await pool.read.exchangeRateStored();
  console.log("Rate at t=15min:", rateHalfway);

  await networkHelpers.time.increase(900); // another 15 minutes, full window elapsed
  const rateFull = await pool.read.exchangeRateStored();
  console.log("Rate at t=30min:", rateFull);

  await networkHelpers.time.increase(900); // past the window, should not exceed full
  const rateAfter = await pool.read.exchangeRateStored();
  console.log("Rate at t=45min (past window):", rateAfter);
});