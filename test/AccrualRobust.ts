import { network } from "hardhat";
import { parseUnits } from "viem";
import { test } from "node:test";

test("scenario 1: first depositor into a pre-funded pool gets no free money", async () => {
  const { viem, networkHelpers } = await network.connect();
  const [owner, user1] = await viem.getWalletClients();

  const token = await viem.deployContract("MockERC20");
  const pool = await viem.deployContract("MockKToken", [token.address, 1500n]);

  await token.write.mint([owner.account.address, parseUnits("1", 18)]);
  await token.write.approve([pool.address, parseUnits("1", 18)], { account: owner.account });
  await pool.write.fundReserve([parseUnits("0.3", 18)], { account: owner.account });

  await networkHelpers.time.increase(200); // most of the 3-min window passes before anyone deposits

  await token.write.mint([user1.account.address, parseUnits("1", 18)]);
  await token.write.approve([pool.address, parseUnits("1", 18)], { account: user1.account });
  await pool.write.mint([parseUnits("1", 18)], { account: user1.account });

  const rate = await pool.read.exchangeRateStored();
  console.log("Scenario 1 - rate right after first deposit (expect exactly 1e18):", rate);
  if (rate !== 1000000000000000000n) throw new Error("FAIL: first depositor got free yield");
  console.log("PASS");
});

test("scenario 2: full withdrawal then redeposit does not lose value", async () => {
  const { viem, networkHelpers } = await network.connect();
  const [owner, user1] = await viem.getWalletClients();

  const token = await viem.deployContract("MockERC20");
  const pool = await viem.deployContract("MockKToken", [token.address, 1500n]);

  await token.write.mint([owner.account.address, parseUnits("1", 18)]);
  await token.write.approve([pool.address, parseUnits("1", 18)], { account: owner.account });
  await pool.write.fundReserve([parseUnits("0.3", 18)], { account: owner.account });

  await token.write.mint([user1.account.address, parseUnits("2", 18)]);
  await token.write.approve([pool.address, parseUnits("2", 18)], { account: user1.account });
  await pool.write.mint([parseUnits("1", 18)], { account: user1.account });

  // full withdrawal
  const shares = await pool.read.balanceOf([user1.account.address]);
  await pool.write.redeem([shares], { account: user1.account });

  // redeposit
  await pool.write.mint([parseUnits("1", 18)], { account: user1.account });

  const rate = await pool.read.exchangeRateStored();
  console.log("Scenario 2 - rate right after redeposit (expect exactly 1e18, not less):", rate);
  if (rate !== 1000000000000000000n) throw new Error(`FAIL: value lost after withdraw+redeposit, got ${rate}`);
  console.log("PASS");
});

test("scenario 3: yield unlocks gradually and correctly over time", async () => {
  const { viem, networkHelpers } = await network.connect();
  const [owner, user1] = await viem.getWalletClients();

  const token = await viem.deployContract("MockERC20");
  const pool = await viem.deployContract("MockKToken", [token.address, 1500n]);

  await token.write.mint([user1.account.address, parseUnits("1", 18)]);
  await token.write.approve([pool.address, parseUnits("1", 18)], { account: user1.account });
  await pool.write.mint([parseUnits("1", 18)], { account: user1.account });

  await token.write.mint([owner.account.address, parseUnits("1", 18)]);
  await token.write.approve([pool.address, parseUnits("1", 18)], { account: owner.account });
  await pool.write.fundReserve([parseUnits("0.3", 18)], { account: owner.account });

  const rateAtStart = await pool.read.exchangeRateStored();
  console.log("Scenario 3 - rate at t=0 (expect 1e18):", rateAtStart);

  await networkHelpers.time.increase(90); // half of 3 minutes
  const rateHalfway = await pool.read.exchangeRateStored();
  console.log("Scenario 3 - rate at t=90s (expect ~1.15e18):", rateHalfway);

  await networkHelpers.time.increase(90); // full window elapsed
  const rateFull = await pool.read.exchangeRateStored();
  console.log("Scenario 3 - rate at t=180s (expect 1.3e18):", rateFull);
  if (rateFull !== 1300000000000000000n) throw new Error("FAIL: full unlock didn't reach expected value");
  console.log("PASS");
});

test("scenario 4: multiple funding rounds across generations pace correctly", async () => {
  const { viem, networkHelpers } = await network.connect();
  const [owner, user1] = await viem.getWalletClients();

  const token = await viem.deployContract("MockERC20");
  const pool = await viem.deployContract("MockKToken", [token.address, 1500n]);

  // round 1: fund, deposit, wait full window, withdraw everything
  await token.write.mint([owner.account.address, parseUnits("1", 18)]);
  await token.write.approve([pool.address, parseUnits("1", 18)], { account: owner.account });
  await pool.write.fundReserve([parseUnits("0.3", 18)], { account: owner.account });

  await token.write.mint([user1.account.address, parseUnits("1", 18)]);
  await token.write.approve([pool.address, parseUnits("1", 18)], { account: user1.account });
  await pool.write.mint([parseUnits("1", 18)], { account: user1.account });

  await networkHelpers.time.increase(200); // past the 3-min window
  const rateRound1 = await pool.read.exchangeRateStored();
  console.log("Scenario 4 - round 1 rate at full unlock (expect 1.3e18):", rateRound1);

  const shares = await pool.read.balanceOf([user1.account.address]);
  await pool.write.redeem([shares], { account: user1.account }); // pool now fully empty

  // round 2: fund again, deposit again — should pace fresh against ONLY this new funding
  await token.write.mint([owner.account.address, parseUnits("1", 18)]);
  await token.write.approve([pool.address, parseUnits("1", 18)], { account: owner.account });
  await pool.write.fundReserve([parseUnits("0.3", 18)], { account: owner.account });

  await token.write.mint([user1.account.address, parseUnits("1", 18)]);
  await token.write.approve([pool.address, parseUnits("1", 18)], { account: user1.account });
  await pool.write.mint([parseUnits("1", 18)], { account: user1.account });

  const rateRound2Start = await pool.read.exchangeRateStored();
  console.log("Scenario 4 - round 2 rate right after fresh deposit (expect exactly 1e18):", rateRound2Start);
  if (rateRound2Start !== 1000000000000000000n) throw new Error(`FAIL: round 2 didn't start clean, got ${rateRound2Start}`);

  await networkHelpers.time.increase(90); // half of round 2's window
  const rateRound2Half = await pool.read.exchangeRateStored();
  console.log("Scenario 4 - round 2 rate at 90s (expect ~1.15e18, NOT already at 1.3):", rateRound2Half);
  if (rateRound2Half >= 1300000000000000000n) throw new Error(`FAIL: round 2 paced too fast, got ${rateRound2Half}`);
  if (rateRound2Half < 1140000000000000000n || rateRound2Half > 1160000000000000000n) {
    throw new Error(`FAIL: round 2 rate not close to expected 1.15e18, got ${rateRound2Half}`);
  }

  console.log("PASS");
});