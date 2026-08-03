import { network } from "hardhat";

const FXRP_ADDRESS = "0x0b6A3645c240605887a5532109323A3E12273dc7";
const POOL_HIGH = "0x2E686989b83026E6f585749EF491eB869765123F";
const AMOUNT = 300_000n;

const erc20Abi = [
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
] as const;

const poolAbi = [
  { type: "function", name: "fundReserve", stateMutability: "nonpayable", inputs: [{ name: "amount", type: "uint256" }], outputs: [] },
] as const;

const { viem } = await network.create({ network: "coston2", chainType: "l1" });
const [senderClient] = await viem.getWalletClients();
const publicClient = await viem.getPublicClient();

const approveTx = await senderClient.writeContract({ address: FXRP_ADDRESS, abi: erc20Abi, functionName: "approve", args: [POOL_HIGH, AMOUNT] });
await publicClient.waitForTransactionReceipt({ hash: approveTx });
console.log("approved");

const fundTx = await senderClient.writeContract({ address: POOL_HIGH, abi: poolAbi, functionName: "fundReserve", args: [AMOUNT] });
await publicClient.waitForTransactionReceipt({ hash: fundTx });
console.log("funded:", fundTx);