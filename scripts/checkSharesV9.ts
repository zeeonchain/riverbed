import { network } from "hardhat";

const RIVERBED_ADDRESS = "0x786a38bCa7880DED068F03B763aCEE7A703547ED";

const { viem } = await network.create({
  network: "coston2",
  chainType: "l1",
});

const [senderClient] = await viem.getWalletClients();
const riverbed = await viem.getContractAt("Riverbed", RIVERBED_ADDRESS);

const myShares = await riverbed.read.shares([senderClient.account.address]);
const totalShares = await riverbed.read.totalShares();
const totalValue = await riverbed.read.totalValue();

console.log("My shares:", myShares);
console.log("Total shares:", totalShares);
console.log("Total value:", totalValue);