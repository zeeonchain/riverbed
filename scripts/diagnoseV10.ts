import { network } from "hardhat";

const RIVERBED_ADDRESS = "0xf480B767e6Bd060dBcb3E739F873d54b2079D970";
const FXRP = "0x0b6A3645c240605887a5532109323A3E12273dc7";

const poolAbi = [
  { type: "function", name: "reserveFundedTotal", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "reserveStart", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "principalCash", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "exchangeRateStored", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;

const erc20Abi = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
] as const;

const { viem } = await network.create({ network: "coston2", chainType: "l1" });
const publicClient = await viem.getPublicClient();
const riverbed = await viem.getContractAt("Riverbed", RIVERBED_ADDRESS);

const activePool = await riverbed.read.activePool();
console.log("Active pool:", activePool);

const reserveFundedTotal = await publicClient.readContract({ address: activePool, abi: poolAbi, functionName: "reserveFundedTotal" });
const reserveStart = await publicClient.readContract({ address: activePool, abi: poolAbi, functionName: "reserveStart" });
const principalCash = await publicClient.readContract({ address: activePool, abi: poolAbi, functionName: "principalCash" });
const totalSupply = await publicClient.readContract({ address: activePool, abi: poolAbi, functionName: "totalSupply" });
const rate = await publicClient.readContract({ address: activePool, abi: poolAbi, functionName: "exchangeRateStored" });
const cash = await publicClient.readContract({ address: FXRP, abi: erc20Abi, functionName: "balanceOf", args: [activePool] });

console.log("reserveFundedTotal:", reserveFundedTotal);
console.log("reserveStart:", reserveStart, "(", new Date(Number(reserveStart) * 1000).toISOString(), ")");
console.log("current time:", Math.floor(Date.now()/1000), "(", new Date().toISOString(), ")");
console.log("principalCash:", principalCash);
console.log("totalSupply:", totalSupply);
console.log("actual cash held:", cash);
console.log("exchangeRateStored:", rate);