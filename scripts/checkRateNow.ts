import { network } from "hardhat";

const POOL_HIGH = "0x0c0AdBaC14f9DD129e973395c9198bf60343817B";

const poolAbi = [
  {
    type: "function",
    name: "exchangeRateStored",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

const { viem } = await network.create({
  network: "coston2",
  chainType: "l1",
});

const publicClient = await viem.getPublicClient();

const rate = await publicClient.readContract({
  address: POOL_HIGH,
  abi: poolAbi,
  functionName: "exchangeRateStored",
});

console.log("PoolHigh current exchange rate:", rate);