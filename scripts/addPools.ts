import { network } from "hardhat";

const RIVERBED_ADDRESS = "0xf480B767e6Bd060dBcb3E739F873d54b2079D970";
const POOL_LOW = "0x3894b277B77Dd1f13B3c0D59A3c59bFE876fd3fd";
const POOL_MID = "0x44Df8874aDF67DE9D4156Ffd3D65A43F75f30c62";
const POOL_HIGH = "0x2E686989b83026E6f585749EF491eB869765123F";

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