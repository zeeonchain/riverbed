import { network } from "hardhat";

const FXRP_ADDRESS = "0x0b6A3645c240605887a5532109323A3E12273dc7";

const pools = {
  PoolLow: { address: "0xd5F89cD0227fEa485704BFe55CaC91FC29fEb5F7", amount: 100_000n },
  PoolMid: { address: "0xF91fca1327867584865c38c095f053Ba2BaA33D2", amount: 200_000n },
  PoolHigh: { address: "0xA6A3073AF927BCAb02d747B7a81b9d1c06f5FADb", amount: 300_000n },
};

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
    name: "fundReserve",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
] as const;

const { viem } = await network.create({
  network: "coston2",
  chainType: "l1",
});

const [senderClient] = await viem.getWalletClients();
const publicClient = await viem.getPublicClient();

for (const [name, { address, amount }] of Object.entries(pools)) {
  console.log(`Funding ${name} reserve with ${amount}...`);

  const approveTx = await senderClient.writeContract({
    address: FXRP_ADDRESS,
    abi: erc20Abi,
    functionName: "approve",
    args: [address as `0x${string}`, amount],
  });
  console.log(`  approve tx: ${approveTx}, waiting for confirmation...`);
  await publicClient.waitForTransactionReceipt({ hash: approveTx });

  const fundTx = await senderClient.writeContract({
    address: address as `0x${string}`,
    abi: poolAbi,
    functionName: "fundReserve",
    args: [amount],
  });
  console.log(`  fund tx: ${fundTx}, waiting for confirmation...`);
  await publicClient.waitForTransactionReceipt({ hash: fundTx });

  console.log(`  ${name} funded successfully.`);
}

console.log("All reserves funded.");