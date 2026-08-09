import { network } from "hardhat";

const RIVERBED_ADDRESS = "0x75a86F09fA736c48902d94c24043C96499529996";
const POOL_LOW = "0x70C97A438438cD516dE7CC7ba74e80384AC95950";
const POOL_MID = "0x5d6D630FfB92bbF6B47c2222C3a26c00Ffc9907f";
const POOL_HIGH = "0x76A3A8DC149a839768E21A976795eB59d6e15B98";

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