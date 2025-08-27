// deploy-nft.js
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { createRequire } from "module"; // Import createRequire

const require = createRequire(import.meta.url); // Create a require function for CommonJS modules

async function main() {
  // --- Configuration ---
  // Replace with your Sepolia RPC URL (e.g., from Infura, Alchemy)
  const sepoliaRpcUrl =
    process.env.SEPOLIA_RPC_URL || "YOUR_SEPOLIA_RPC_URL_HERE";
  // Replace with the private key of the wallet that will deploy the contract
  // This wallet MUST have Sepolia ETH
  const deployerPrivateKey =
    process.env.WALLET_PRIVATE_KEY || "YOUR_DEPLOYER_PRIVATE_KEY_HERE";

  // --- Provider and Signer ---
  const provider = new ethers.JsonRpcProvider(sepoliaRpcUrl);
  const signer = new ethers.Wallet(deployerPrivateKey, provider);

  console.log("Deploying contract with the account:", signer.address);

  // --- Load Contract Artifacts ---
  // If using Hardhat:
  const contractArtifact = require("./artifacts/contracts/TraderCertificationNFT.sol/TraderCertificationNFT.json");
  const abi = contractArtifact.abi;
  const bytecode = contractArtifact.bytecode;

  // --- Deploy Contract ---
  const ContractFactory = new ethers.ContractFactory(abi, bytecode, signer);
  console.log("Deploying TraderCertificationNFT...");
  const contract = await ContractFactory.deploy();

  console.log("Transaction hash:", contract.deploymentTransaction().hash);
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("TraderCertificationNFT deployed to:", contractAddress);

  // --- IMPORTANT: Update your nftService.ts ---
  console.log("\n----------------------------------------------------");
  console.log("UPDATE YOUR nftService.ts WITH THIS ADDRESS:");
  console.log(`const NFT_CONTRACT_ADDRESS = "${contractAddress}";`);
  console.log("----------------------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
