import { network } from "hardhat";

const RIVERBED_ADDRESS = "0x8Aa67c330F3b5847b99325D1E5c9F70E7CfB10a1";

const { viem } = await network.create({
  network: "coston2",
  chainType: "l1",
});

const [senderClient] = await viem.getWalletClients();
const riverbed = await viem.getContractAt("Riverbed", RIVERBED_ADDRESS);

console.log("Calling rebalance()...");
const tx = await riverbed.write.rebalance({ account: senderClient.account });
console.log("  tx:", tx);
console.log("Done.");