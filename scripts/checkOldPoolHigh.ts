import { network } from "hardhat";

const FXRP_ADDRESS = "0x0b6A3645c240605887a5532109323A3E12273dc7";
const OLD_POOL_HIGH = "0x20029CF15C842E9691EaC7a95FFc1b222FF436dF";

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

const balance = await publicClient.readContract({
  address: FXRP_ADDRESS,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [OLD_POOL_HIGH],
});

console.log("Old PoolHigh balance:", balance);