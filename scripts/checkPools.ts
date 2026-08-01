import { network } from "hardhat";

const RIVERBED_ADDRESS = "0x786a38bCa7880DED068F03B763aCEE7A703547ED";

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