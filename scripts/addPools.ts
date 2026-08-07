import { network } from "hardhat";

const RIVERBED_ADDRESS = "0x5a51CcA24c57574B2f59BFDbb7851f931fAf6caA";
const POOL_LOW = "0x230B9cf57ED822354E8847192D62F006CF1D9291";
const POOL_MID = "0x37e5ba65f201d8A268E99851A078209F25BB6B67";
const POOL_HIGH = "0x849B05757A5525610aE9836597a27Ce481389336";

const { viem } = await network.create({
  network: "coston2",
  chainType: "l1",
});

const [senderClient] = await viem.getWalletClients();
const riverbed = await viem.getContractAt("Riverbed", RIVERBED_ADDRESS);

for (const [name, pool] of [
  ["PoolLow", POOL_LOW],
  ["PoolMid", POOL_MID],
  ["PoolHigh", POOL_HIGH],
] as const) {
  console.log(`Adding ${name} (${pool})...`);
  const tx = await riverbed.write.addPool([pool], { account: senderClient.account });
  console.log(`  tx: ${tx}`);
}

console.log("All pools added.");