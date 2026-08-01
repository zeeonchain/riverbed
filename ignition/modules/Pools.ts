import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PoolsModule", (m) => {
  const fxrpAddress = m.getParameter("fxrpAddress");

  const poolLow = m.contract("MockKToken", [fxrpAddress, 300n], { id: "PoolLow" });
  const poolMid = m.contract("MockKToken", [fxrpAddress, 800n], { id: "PoolMid" });
  const poolHigh = m.contract("MockKToken", [fxrpAddress, 1500n], { id: "PoolHigh" });

  return { poolLow, poolMid, poolHigh };
});