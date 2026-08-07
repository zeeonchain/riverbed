import { network } from "hardhat";

const RIVERBED_ADDRESS = "0x542c98b7aaa6CFcF7e5d44B52bB7ED958eB75e36";
const FXRP_ADDRESS = "0x0b6A3645c240605887a5532109323A3E12273dc7";
const AMOUNT = 1_000n; // tiny amount, 0.001 FXRP

const erc20Abi = [
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
] as const;

const { viem } = await network.create({ network: "coston2", chainType: "l1" });
const [senderClient] = await viem.getWalletClients();
const publicClient = await viem.getPublicClient();
const riverbed = await viem.getContractAt("Riverbed", RIVERBED_ADDRESS);

const approveTx = await senderClient.writeContract({ address: FXRP_ADDRESS, abi: erc20Abi, functionName: "approve", args: [RIVERBED_ADDRESS, AMOUNT] });
await publicClient.waitForTransactionReceipt({ hash: approveTx });
console.log("approved");

const depositTx = await riverbed.write.deposit([AMOUNT], { account: senderClient.account });
await publicClient.waitForTransactionReceipt({ hash: depositTx });
console.log("deposited:", depositTx);

const myShares = await riverbed.read.shares([senderClient.account.address]);
const withdrawTx = await riverbed.write.withdraw([myShares], { account: senderClient.account });
console.log("withdrew:", withdrawTx);