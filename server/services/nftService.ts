import { ethers } from "ethers";

// Replace with your actual contract address and ABI
const NFT_CONTRACT_ADDRESS = "0xF5322EB08282c7DeD91CcD2CA545ef146b4C5021"; // TODO: Replace with your deployed NFT contract address
const NFT_CONTRACT_ABI = [
  // ABI for the awardCertification function
  "function awardCertification(address trader, uint8 level)",
  // ABI for the CertificationAwarded event
  "event CertificationAwarded(address indexed trader, uint8 level, uint256 tokenId)",
];

// Ensure your private key is loaded securely, e.g., from environment variables
// DO NOT hardcode private keys in production!
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || ""; // TODO: Set your wallet private key in environment variables

const provider = new ethers.JsonRpcProvider(
  process.env.SEPOLIA_RPC_URL ||
    "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID",
); // TODO: Replace with your Sepolia RPC URL
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const nftContract = new ethers.Contract(
  NFT_CONTRACT_ADDRESS,
  NFT_CONTRACT_ABI,
  signer,
);

export async function mintCertificationNFT(
  toAddress: string,
  certificationLevel: "Bronze" | "Silver" | "Gold",
): Promise<string | null> {
  try {
    let level: number;
    switch (certificationLevel) {
      case "Bronze":
        level = 1; // Corresponds to CertificationLevel.Bronze in Solidity enum
        break;
      case "Silver":
        level = 2; // Corresponds to CertificationLevel.Silver in Solidity enum
        break;
      case "Gold":
        level = 3; // Corresponds to CertificationLevel.Gold in Solidity enum
      default:
        throw new Error("Invalid certification level provided.");
    }

    const tx = await nftContract.awardCertification(toAddress, level);
    await tx.wait();
    console.log(
      `Successfully minted ${certificationLevel} NFT for ${toAddress}. Transaction hash: ${tx.hash}`,
    );
    // In a real scenario, you might want to parse logs to get the actual tokenId
    return tx.hash;
  } catch (error) {
    console.error(
      `Error minting ${certificationLevel} NFT for ${toAddress}:`,
      error,
    );
    return null;
  }
}
