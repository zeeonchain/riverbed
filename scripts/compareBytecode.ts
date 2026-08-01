import { network } from "hardhat";
import fs from "fs";

const RIVERBED_ADDRESS = "0x8Aa67c330F3b5847b99325D1E5c9F70E7CfB10a1";

const { viem } = await network.create({
  network: "coston2",
  chainType: "l1",
});

const publicClient = await viem.getPublicClient();
const onChainCode = await publicClient.getCode({ address: RIVERBED_ADDRESS });

const artifact = JSON.parse(
  fs.readFileSync("artifacts/contracts/Riverbed.sol/Riverbed.json", "utf-8")
);

console.log("On-chain length:", onChainCode?.length);
console.log("Local artifact length:", artifact.deployedBytecode.length);
console.log("First 100 chars match:", onChainCode?.slice(0, 100) === artifact.deployedBytecode.slice(0, 100));