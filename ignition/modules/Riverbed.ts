import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("RiverbedModule", (m) => {
  const fxrpAddress = m.getParameter("fxrpAddress");
  const riverbed = m.contract("Riverbed", [fxrpAddress]);
  return { riverbed };
});