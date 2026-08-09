import { network } from "hardhat";
import { parseUnits } from "viem";
import { test } from "node:test";

test("Riverbed withdrawal fully drains pool so reserve resets cleanly", async () => {
  const { viem } = await network.connect();
  const [owner, user1] = await viem.getWalletClients();

  const token = await viem.deployContract("MockERC20");
  const pool = await viem.deployContract("MockKToken", [token.address, 1500n]);
  const riverbed = await viem.deployContract("Riverbed", [token.address]);

  await riverbed.write.addPool([pool.address], { account: owner.account });

  // fund the pool's reserve ahead of time
  await token.write.mint([owner.account.address, parseUnits("1", 18)]);
  await token.write.approve([pool.address, parseUnits("1", 18)], { account: owner.account });
  await pool.write.fundReserve([parseUnits("0.3", 18)], { account: owner.account });

  // user deposits into Riverbed, which auto-routes into the pool
  await token.write.mint([user1.account.address, parseUnits("1", 18)]);
  await token.write.approve([riverbed.address, parseUnits("1", 18)], { account: user1.account });
  await riverbed.write.deposit([parseUnits("1", 18)], { account: user1.account });

  // simulate some leftover idle cash sitting in Riverbed (the cushioning scenario)
  await token.write.mint([riverbed.address, parseUnits("0.1", 18)], { account: owner.account });

  // user withdraws everything
  const myShares = await riverbed.read.shares([user1.account.address]);
  await riverbed.write.withdraw([myShares], { account: user1.account });

  const poolSupplyAfter = await pool.read.totalSupply();
  const reserveAfter = await pool.read.reserveFundedTotal();

  console.log("Pool totalSupply after full Riverbed withdrawal:", poolSupplyAfter);
  console.log("Pool reserveFundedTotal after full Riverbed withdrawal:", reserveAfter);

  if (poolSupplyAfter !== 0n) throw new Error(`FAIL: pool still has supply, got ${poolSupplyAfter}`);
  if (reserveAfter !== 0n) throw new Error(`FAIL: reserve did not reset, got ${reserveAfter}`);

  console.log("PASS");
});