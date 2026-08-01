import { network } from "hardhat";

const FXRP_ADDRESS = "0x0b6A3645c240605887a5532109323A3E12273dc7";

const pools = {
  PoolLow: "0x736c0DFf94B1bc22f93E246dD53C512B4bc21FC5",
  PoolMid: "0xf41D3E7efFC282F24Fd7C67e297806a59E4d6559",
  PoolHigh: "0x0C81FE56626137Dd3CAb23a7bbB566186b717556",
};

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

for (const [name, address] of Object.entries(pools)) {
  const balance = await publicClient.readContract({
    address: address as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
  });
  console.log(`${name} balance:`, balance);
}