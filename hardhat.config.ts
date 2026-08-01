import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
   coston2: {
      type: "http",
      chainType: "l1",
      url: "https://coston2-api.flare.network/ext/C/rpc",
      accounts: [configVariable("COSTON2_PRIVATE_KEY")],
    },
  },
chainDescriptors: {
    114: {
      name: "Coston2",
      blockExplorers: {
        blockscout: {
          name: "Coston2 Explorer",
          url: "https://coston2-explorer.flare.network",
          apiUrl: "https://coston2-explorer.flare.network/api",
        },
      },
    },
  },
});