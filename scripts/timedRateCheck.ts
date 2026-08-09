import { network } from "hardhat";

const POOL_HIGH = "0x849B05757A5525610aE9836597a27Ce481389336";
const RIVERBED_ADDRESS = "0x5a51CcA24c57574B2f59BFDbb7851f931fAf6caA";
const FXRP_ADDRESS = "0x0b6A3645c240605887a5532109427ff56F4Ec1Eb"; // placeholder, will fix below

const poolAbi = [
  { type: "function", name: "exchangeRateStored", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "reserveStart", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "reserveFundedTotal", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;

const { viem } = await network.create({ network: "coston2", chainType: "l1" });
const publicClient = await viem.getPublicClient();

const rate = await publicClient.readContract({ address: POOL_HIGH, abi: poolAbi, functionName: "exchangeRateStored" });
const reserveStart = await publicClient.readContract({ address: POOL_HIGH, abi: poolAbi, functionName: "reserveStart" });
const reserveFundedTotal = await publicClient.readContract({ address: POOL_HIGH, abi: poolAbi, functionName: "reserveFundedTotal" });

const now = Math.floor(Date.now() / 1000);
console.log("Current rate:", rate);
console.log("reserveStart:", reserveStart, new Date(Number(reserveStart) * 1000).toISOString());
console.log("reserveFundedTotal:", reserveFundedTotal);
console.log("Seconds elapsed since reserveStart:", now - Number(reserveStart));