import { network } from "hardhat";

const RIVERBED_ADDRESS = "0x8Aa67c330F3b5847b99325D1E5c9F70E7CfB10a1";
const FXRP_ADDRESS = "0x0b6A3645c240605887a5532109323A3E12273dc7";
const DEPOSIT_AMOUNT = 2_000_000n; // 2 FXRP, 6 decimals

const erc20Abi = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

const { viem } = await network.create({
  network: "coston2",
  chainType: "l1",
});

const [senderClient] = await viem.getWalletClients();

console.log("Approving Riverbed to spend FXRP...");
const approveTx = await senderClient.writeContract({
  address: FXRP_ADDRESS,
  abi: erc20Abi,
  functionName: "approve",
  args: [RIVERBED_ADDRESS, DEPOSIT_AMOUNT],
});
console.log("  approve tx:", approveTx);

const riverbed = await viem.getContractAt("Riverbed", RIVERBED_ADDRESS);

console.log("Depositing 2 FXRP into Riverbed...");
const depositTx = await riverbed.write.deposit([DEPOSIT_AMOUNT], {
  account: senderClient.account,
});
console.log("  deposit tx:", depositTx);

console.log("Done.");