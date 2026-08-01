import { network } from "hardhat";

const RIVERBED_ADDRESS = "0xa68a525db35B854fF62933850b51399E6B217d1F";
const POOL_LOW = "0x451238a67347953a48A6bf4847dc2DB715FBcf19";
const POOL_MID = "0x1d539b10957C10F7CbBfCD7EA58E2b1Ab44691B9";
const POOL_HIGH = "0x0c0AdBaC14f9DD129e973395c9198bf60343817B";

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