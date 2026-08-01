import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PoolExtraModule", (m) => {
  const fxrpAddress = m.getParameter("fxrpAddress");
  const poolBest = m.contract("MockKToken", [fxrpAddress, 2000n], { id: "PoolBest" });
  return { poolBest };
});