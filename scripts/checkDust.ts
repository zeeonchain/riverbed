import { network } from "hardhat";

const POOL_HIGH = "0x7aD124418e3Cdb68BBA115CFC1E71A9cAF802b52";

const { viem } = await network.create({ network: "coston2", chainType: "l1" });
const [senderClient] = await viem.getWalletClients();
const pool = await viem.getContractAt("MockKToken", POOL_HIGH);

const myBalance = await pool.read.balanceOf([senderClient.account.address]);
console.log("Your kToken balance in PoolHigh:", myBalance);