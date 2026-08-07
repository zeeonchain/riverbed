import { network } from "hardhat";

const RIVERBED_ADDRESS = "0x5a51CcA24c57574B2f59BFDbb7851f931fAf6caA";

const { viem } = await network.create({
  network: "coston2",
  chainType: "l1",
});

const riverbed = await viem.getContractAt("Riverbed", RIVERBED_ADDRESS);
const publicClient = await viem.getPublicClient();

let i = 0;
while (i < 30) {
  try {
    const pool = await riverbed.read.pools([BigInt(i)]);
    console.log(`Pool ${i}:`, pool);
    i++;
  } catch {
    break;
  }
}
console.log("Total pools found:", i);