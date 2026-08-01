import { network } from "hardhat";

const POOL_BEST = "0xf9fAf45A36e6AE295099E0CfA982B4e3E3ad8cb6";

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
  address: POOL_BEST,
  abi: poolAbi,
  functionName: "exchangeRateStored",
});

console.log("PoolBest current exchange rate:", rate);