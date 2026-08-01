import { network } from "hardhat";

const RIVERBED_ADDRESS = "0x8Aa67c330F3b5847b99325D1E5c9F70E7CfB10a1";

const { viem } = await network.create({
  network: "coston2",
  chainType: "l1",
});

const [senderClient] = await viem.getWalletClients();

const riverbedAbi = [
  {
    type: "function",
    name: "shares",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "totalShares",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "totalValue",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

const publicClient = await viem.getPublicClient();

const myShares = await publicClient.readContract({
  address: RIVERBED_ADDRESS,
  abi: riverbedAbi,
  functionName: "shares",
  args: [senderClient.account.address],
});

const totalShares = await publicClient.readContract({
  address: RIVERBED_ADDRESS,
  abi: riverbedAbi,
  functionName: "totalShares",
});

const totalValue = await publicClient.readContract({
  address: RIVERBED_ADDRESS,
  abi: riverbedAbi,
  functionName: "totalValue",
});

console.log("My shares:", myShares);
console.log("Total shares:", totalShares);
console.log("Total value (FXRP):", totalValue);