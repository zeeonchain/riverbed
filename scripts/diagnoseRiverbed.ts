import { network } from "hardhat";

const RIVERBED_ADDRESS = "0x786a38bCa7880DED068F03B763aCEE7A703547ED";
const FXRP = "0x0b6A3645c240605887a5532109323A3E12273dc7";

const erc20Abi = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
] as const;

const poolAbi = [
  { type: "function", name: "reserve", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "exchangeRateStored", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;

const { viem } = await network.create({ network: "coston2", chainType: "l1" });
const publicClient = await viem.getPublicClient();
const riverbed = await viem.getContractAt("Riverbed", RIVERBED_ADDRESS);

const activePool = await riverbed.read.activePool();
console.log("Active pool:", activePool);

const idleCash = await publicClient.readContract({ address: FXRP, abi: erc20Abi, functionName: "balanceOf", args: [RIVERBED_ADDRESS] });
console.log("Riverbed idle FXRP:", idleCash);

const kBalance = await publicClient.readContract({ address: activePool, abi: erc20Abi, functionName: "balanceOf", args: [RIVERBED_ADDRESS] });
console.log("Riverbed kToken balance in active pool:", kBalance);

const poolSupply = await publicClient.readContract({ address: activePool, abi: poolAbi, functionName: "totalSupply" });
console.log("Pool total kToken supply:", poolSupply);

const poolCash = await publicClient.readContract({ address: FXRP, abi: erc20Abi, functionName: "balanceOf", args: [activePool] });
console.log("Pool actual FXRP cash held:", poolCash);

const rate = await publicClient.readContract({ address: activePool, abi: poolAbi, functionName: "exchangeRateStored" });
console.log("Pool exchange rate:", rate);

const reserve = await publicClient.readContract({ address: activePool, abi: poolAbi, functionName: "reserve" });
console.log("Pool reserve bookkeeping:", reserve);

const totalValue = await riverbed.read.totalValue();
console.log("Riverbed totalValue():", totalValue);