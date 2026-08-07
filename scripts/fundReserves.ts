import { network } from "hardhat";

const FXRP_ADDRESS = "0x0b6A3645c240605887a5532109323A3E12273dc7";

const pools = {
  PoolLow: { address: "0xB7f75559Cb686287a15827477c809542763b1b84", amount: 100_000n },
  PoolMid: { address: "0x5a86BAAeFD2407A104D1F3BdbD3d638E8cb73925", amount: 200_000n },
  PoolHigh: { address: "0xd308FD86827848Ea864b9bEEE8427e5847ab85e3", amount: 300_000n },
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