import { network } from "hardhat";

const POOL_HIGH = "0x849B05757A5525610aE9836597a27Ce481389336";
const FXRP_ADDRESS = "0x0b6A3645c240605887a5532109323A3E12273dc7";

const erc20Abi = [
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
] as const;

const { viem } = await network.create({ network: "coston2", chainType: "l1" });
const [senderClient] = await viem.getWalletClients();
const publicClient = await viem.getPublicClient();
const pool = await viem.getContractAt("MockKToken", POOL_HIGH);

console.log("Before — reserveFundedTotal:", await pool.read.reserveFundedTotal());
console.log("Before — totalSupply:", await pool.read.totalSupply());

// mint directly
const approveTx = await senderClient.writeContract({ address: FXRP_ADDRESS, abi: erc20Abi, functionName: "approve", args: [POOL_HIGH, 100000n] });
await publicClient.waitForTransactionReceipt({ hash: approveTx });
const mintTx = await pool.write.mint([100000n], { account: senderClient.account });
await publicClient.waitForTransactionReceipt({ hash: mintTx });
console.log("Minted directly. totalSupply now:", await pool.read.totalSupply());

// redeem everything directly
const myBalance = await pool.read.balanceOf([senderClient.account.address]);
const redeemTx = await pool.write.redeem([myBalance], { account: senderClient.account });
await publicClient.waitForTransactionReceipt({ hash: redeemTx });

console.log("After direct redeem — totalSupply:", await pool.read.totalSupply());
console.log("After direct redeem — reserveFundedTotal:", await pool.read.reserveFundedTotal());