import { network } from "hardhat";

const FXRP_ADDRESS = "0x0b6A3645c240605887a5532109323A3E12273dc7";
const POOL_BEST = "0xf9fAf45A36e6AE295099E0CfA982B4e3E3ad8cb6";
const RIVERBED_ADDRESS = "0x8Aa67c330F3b5847b99325D1E5c9F70E7CfB10a1";

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

const publicClient = await viem.getPublicClient();

const poolBalance = await publicClient.readContract({
  address: FXRP_ADDRESS,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [POOL_BEST],
});

const riverbedBalance = await publicClient.readContract({
  address: FXRP_ADDRESS,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [RIVERBED_ADDRESS],
});

console.log("PoolBest FXRP balance:", poolBalance);
console.log("Riverbed idle FXRP balance:", riverbedBalance);