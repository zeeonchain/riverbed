import { network } from "hardhat";

const FXRP_ADDRESS = "0x0b6A3645c240605887a5532109323A3E12273dc7";

const minimalAbi = [
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
] as const;

const { viem } = await network.create({
  network: "coston2",
  chainType: "l1",
});

const publicClient = await viem.getPublicClient();

const decimals = await publicClient.readContract({
  address: FXRP_ADDRESS,
  abi: minimalAbi,
  functionName: "decimals",
});

const symbol = await publicClient.readContract({
  address: FXRP_ADDRESS,
  abi: minimalAbi,
  functionName: "symbol",
});

console.log(`${symbol} decimals:`, decimals);