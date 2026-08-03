import { network } from "hardhat";

const RIVERBED_ADDRESS = "0x5307F8b578fE3dE5D628df416e133D5DAEcBe84E";
const POOL_LOW = "0xdA084A44073729725802B92357492fF56F4Ec1Eb";
const POOL_MID = "0xbe740D8Fae7771aA61B04DfD649a62d1782aFFd1";
const POOL_HIGH = "0x7aD124418e3Cdb68BBA115CFC1E71A9cAF802b52";

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