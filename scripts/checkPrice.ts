import { network } from "hardhat";

const { viem } = await network.create();
const riverbed = await viem.getContractAt(
  "Riverbed",
  "0x04ed724eae070f1d136b88ba9cff5c09b77423b6"
);

const [price, decimals, timestamp] = await riverbed.read.getXrpUsdPrice();
console.log("XRP/USD price:", price.toString());
console.log("decimals:", decimals);
console.log("timestamp:", timestamp.toString());