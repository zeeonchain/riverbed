import { network } from "hardhat";

const RIVERBED_ADDRESS = "0xa68a525db35B854fF62933850b51399E6B217d1F";

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