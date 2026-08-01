import { network } from "hardhat";

const RIVERBED_ADDRESS = "0x32915bb23E14Edb9366383141011492576eC03e9";
const FXRP_ADDRESS = "0x0b6A3645c240605887a5532109323A3E12273dc7";
const SHARE_AMOUNT = 2_000_000n; // all shares

const erc20Abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

const { viem } = await network.create({
  network: "coston2",
  chainType: "l1",
});

const [senderClient] = await viem.getWalletClients();
const publicClient = await viem.getPublicClient();

const balanceBefore = await publicClient.readContract({
  address: FXRP_ADDRESS,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [senderClient.account.address],
});
console.log("FXRP balance before withdraw:", balanceBefore);

const riverbed = await viem.getContractAt("Riverbed", RIVERBED_ADDRESS);

console.log("Withdrawing all shares...");
const tx = await riverbed.write.withdraw([SHARE_AMOUNT], {
  account: senderClient.account,
});
console.log("  tx:", tx);

await new Promise((r) => setTimeout(r, 5000)); // wait for confirmation

const balanceAfter = await publicClient.readContract({
  address: FXRP_ADDRESS,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [senderClient.account.address],
});
console.log("FXRP balance after withdraw:", balanceAfter);
console.log("Gained:", balanceAfter - balanceBefore, "(base units, 6 decimals)");