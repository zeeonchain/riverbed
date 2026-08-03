import { network } from "hardhat";

const RIVERBED_ADDRESS = "0xf480B767e6Bd060dBcb3E739F873d54b2079D970";

const { viem } = await network.create({ network: "coston2", chainType: "l1" });
const [senderClient] = await viem.getWalletClients();
const riverbed = await viem.getContractAt("Riverbed", RIVERBED_ADDRESS);

const myShares = await riverbed.read.shares([senderClient.account.address]);
console.log("Shares to withdraw:", myShares);

if (myShares > 0n) {
  const tx = await riverbed.write.withdraw([myShares], { account: senderClient.account });
  console.log("withdraw tx:", tx);
} else {
  console.log("Nothing to withdraw.");
}