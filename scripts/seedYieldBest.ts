import { network } from "hardhat";

const FXRP_ADDRESS = "0x0b6A3645c240605887a5532109323A3E12273dc7";
const POOL_BEST = "0xf9fAf45A36e6AE295099E0CfA982B4e3E3ad8cb6";
const SEED_AMOUNT = 200_000n; // 0.2 FXRP

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

const poolAbi = [
  {
    type: "function",
    name: "seedYield",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
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

const [senderClient] = await viem.getWalletClients();
const publicClient = await viem.getPublicClient();

const rateBefore = await publicClient.readContract({
  address: POOL_BEST,
  abi: poolAbi,
  functionName: "exchangeRateStored",
});
console.log("Exchange rate before seeding:", rateBefore);

console.log("Approving PoolBest to pull FXRP...");
const approveTx = await senderClient.writeContract({
  address: FXRP_ADDRESS,
  abi: erc20Abi,
  functionName: "approve",
  args: [POOL_BEST, SEED_AMOUNT],
});
console.log("  approve tx:", approveTx);

console.log("Seeding yield into PoolBest...");
const seedTx = await senderClient.writeContract({
  address: POOL_BEST,
  abi: poolAbi,
  functionName: "seedYield",
  args: [SEED_AMOUNT],
});
console.log("  seed tx:", seedTx);