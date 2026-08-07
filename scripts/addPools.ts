import { network } from "hardhat";

const RIVERBED_ADDRESS = "0x542c98b7aaa6CFcF7e5d44B52bB7ED958eB75e36";
const POOL_LOW = "0xB7f75559Cb686287a15827477c809542763b1b84";
const POOL_MID = "0x5a86BAAeFD2407A104D1F3BdbD3d638E8cb73925";
const POOL_HIGH = "0xd308FD86827848Ea864b9bEEE8427e5847ab85e3";

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