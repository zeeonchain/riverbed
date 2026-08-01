import { network } from "hardhat";

const POOL_HIGH = "0x52933258561B537ae1e897b8514A0EA38760F7Af";

const poolAbi = [
  {
    type: "function",
    name: "totalSupply",
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

const supply = await publicClient.readContract({
  address: POOL_HIGH,
  abi: poolAbi,
  functionName: "totalSupply",
});

console.log("PoolHigh kToken totalSupply:", supply);