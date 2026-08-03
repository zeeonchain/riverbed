import { network } from "hardhat";

const RIVERBED_ADDRESS = "0x786a38bCa7880DED068F03B763aCEE7A703547ED";
const FXRP_ADDRESS = "0x0b6A3645c240605887a5532109323A3E12273dc7";

const { viem } = await network.create({ network: "coston2", chainType: "l1" });
const [senderClient] = await viem.getWalletClients();
const riverbed = await viem.getContractAt("Riverbed", RIVERBED_ADDRESS);
const publicClient = await viem.getPublicClient();

const myShares = await riverbed.read.shares([senderClient.account.address]);
console.log("Shares to withdraw:", myShares);

if (myShares > 0n) {
  const tx = await riverbed.write.withdraw([myShares], { account: senderClient.account });
  console.log("withdraw tx:", tx);
} else {
  console.log("Nothing to withdraw.");
}