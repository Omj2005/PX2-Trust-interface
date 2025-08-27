import admin from "firebase-admin";
import type { UserRole } from "../../client/contexts/AuthContext";
import { getFirestore } from "firebase-admin/firestore";
import { mintCertificationNFT } from "../services/nftService";

console.log("Value of admin after import:", admin);

let db: FirebaseFirestore.Firestore | null = null;

export function initializeFirestore() {
  console.log("Attempting to initialize Firestore...");
  // Initialize Firebase Admin SDK if not already initialized
  if (admin && !admin.default.apps.length) {
    console.log(
      "Firebase Admin SDK not yet initialized. Checking credentials..."
    );
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log("GOOGLE_APPLICATION_CREDENTIALS is set. Initializing app...");
      admin.default.initializeApp({
        credential: admin.default.credential.applicationDefault(),
    });
      db = getFirestore();
      console.log("Firestore initialized successfully.");
    } else {
      console.warn(
        "GOOGLE_APPLICATION_CREDENTIALS environment variable not set. Firebase Admin SDK will not be initialized.",
      );
    }
  } else if (admin && admin.default.apps.length) {
    console.log("Firebase Admin SDK already initialized.");
    db = getFirestore(); // Ensure db is set if already initialized
  } else if (!admin) {
    console.error(
      "Firebase Admin SDK 'admin' object is undefined. Cannot initialize Firestore.",
    );
  }
  console.log(
    "Current db status after initialization attempt:",
    db ? "initialized" : "null",
  );
}

// ... rest of your file

// User data structure (should match client-side UserData)
export interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt?: string;
  followers?: number;
  following?: number;
  performance?: string;
  specialty?: string;
  walletAddress?: string;
  averageRating?: number;
  reviewCount?: number;
  certification?: string;
  nftTokenId?: string;
}

export interface ReviewData {
  id?: string;
  traderWalletAddress: string;
  reviewerWalletAddress: string;
  rating: number;
  comment: string;
  timestamp: admin.firestore.FieldValue;
}

export const userService = {
  async getUser(userId: string, role?: UserRole): Promise<UserData | null> {
    if (!db) {
      console.error("Firestore is not initialized");
      return null;
    }

    try {
      let userDoc;

      if (role === "trader") {
        userDoc = await db.collection("traders").doc(userId).get();
      } else if (role === "user") {
        userDoc = await db.collection("users").doc(userId).get();
      } else {
        userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
          userDoc = await db.collection("traders").doc(userId).get();
        }
      }

      if (userDoc.exists) {
        return { id: userDoc.id, ...userDoc.data() } as UserData;
      }
      return null;
    } catch (error) {
      console.error("Error getting user (server):", error);
      return null;
    }
  },

  async getUserByWalletAddress(walletAddress: string): Promise<UserData | null> {
    if (!db) {
      console.error("Firestore is not initialized");
      return null;
    }

    try {
      // Normalize the wallet address to lowercase for case-insensitive matching
      const lowerCaseWalletAddress = walletAddress.toLowerCase();
      console.log(
        `Searching for trader with normalized wallet address: ${lowerCaseWalletAddress}`,
      );

      const querySnapshot = await db
        .collection("traders")
        .where("walletAddress", "==", lowerCaseWalletAddress)
        .limit(1)
        .get();

      if (querySnapshot.empty) {
        console.log(`No trader found with wallet address: ${walletAddress}`);
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      console.log(`Found trader:`, userDoc.data());
      return { id: userDoc.id, ...userDoc.data() } as UserData;
    } catch (error) {
      console.error("Error getting user by wallet address (server):", error);
      if (error instanceof Error) {
        console.error("Detailed error message:", error.message);
        console.error("Stack trace:", error.stack);
      } else {
        console.error("Detailed error:", error);
      }
      return null;
    }
  },

  async updateUser(
    userId: string,
    data: Partial<UserData>,
    role: UserRole,
  ): Promise<void> {
    if (!db) {
      throw new Error("Firestore is not initialized");
    }

    try {
      const collection_name = role === "trader" ? "traders" : "users";
      await db.collection(collection_name).doc(userId).update(data);
    } catch (error) {
      console.error("Error updating user (server):", error);
      throw error;
    }
  },

  async createUser(
    userId: string,
    userData: Omit<UserData, "id">,
  ): Promise<void> {
    if (!db) {
      throw new Error("Firestore is not initialized");
    }

    try {
      const collection_name = userData.role === "trader" ? "traders" : "users";
      const dataToWrite = { ...userData };
      if (dataToWrite.walletAddress) {
        dataToWrite.walletAddress = dataToWrite.walletAddress.toLowerCase();
      }
      await db.collection(collection_name).doc(userId).set(dataToWrite);
    } catch (error) {
      console.error("Error creating user (server):", error);
      throw error;
    }
  },
};






export const reviewService = {
  async addReview(reviewData: ReviewData): Promise<void> {
    if (!db) {
      throw new Error("Firestore is not initialized");
    }
    try {
      await db.collection("reviews").add(reviewData);
    } catch (error) {
      console.error("Error adding review:", error);
      throw error;
    }
  },

  async getReviewsByTraderWalletAddress(
    traderWalletAddress: string,
  ): Promise<ReviewData[]> {
    if (!db) {
      console.error("Firestore is not initialized");
      return [];
    }
    try {
      const querySnapshot = await db
        .collection("reviews")
        .where("traderWalletAddress", "==", traderWalletAddress)
        .orderBy("timestamp", "desc")
        .get();
      return querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as ReviewData,
      );
    } catch (error) {
      console.error("Error getting reviews:", error);
      return [];
    }
  },

  async calculateAverageRating(traderWalletAddress: string): Promise<void> {
    if (!db) {
      console.error("Firestore is not initialized");
      return;
    }
    try {
      const reviews =
        await this.getReviewsByTraderWalletAddress(traderWalletAddress);
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      const averageRating =
        reviews.length > 0 ? totalRating / reviews.length : 0;

      const traderQuerySnapshot = await db
        .collection("traders")
        .where("walletAddress", "==", traderWalletAddress)
        .limit(1)
        .get();

      if (!traderQuerySnapshot.empty) {
        const traderDoc = traderQuerySnapshot.docs[0];
        const currentTraderData = traderDoc.data() as UserData;

        let newCertification: string | undefined =
          currentTraderData.certification;
        let newNftTokenId: string | undefined = currentTraderData.nftTokenId;

        // Certification Logic
        if (reviews.length >= 20 && averageRating >= 4.5) {
          if (newCertification !== "Gold") {
            console.log(
              `Trader ${traderWalletAddress} qualifies for Gold certification.`,
            );
            const txHash = await mintCertificationNFT(
              traderWalletAddress,
              "Gold",
            );
            if (txHash) {
              newCertification = "Gold";
              newNftTokenId = txHash; // Using txHash as a placeholder for tokenId
            }
          }
        } else if (reviews.length >= 10 && averageRating >= 4.0) {
          if (newCertification !== "Silver" && newCertification !== "Gold") {
            console.log(
              `Trader ${traderWalletAddress} qualifies for Silver certification.`,
            );
            const txHash = await mintCertificationNFT(
              traderWalletAddress,
              "Silver",
            );
            if (txHash) {
              newCertification = "Silver";
              newNftTokenId = txHash;
            }
          }
        } else if (reviews.length >= 5 && averageRating >= 4.0) {
          if (
            newCertification !== "Bronze" &&
            newCertification !== "Silver" &&
            newCertification !== "Gold"
          ) {
            console.log(
              `Trader ${traderWalletAddress} qualifies for Bronze certification.`,
            );
            const txHash = await mintCertificationNFT(
              traderWalletAddress,
              "Bronze",
            );
            if (txHash) {
              newCertification = "Bronze";
              newNftTokenId = txHash;
            }
          }
        } else {
          // If criteria are no longer met, remove certification
          if (newCertification) {
            console.log(
              `Trader ${traderWalletAddress} no longer qualifies for certification.`,
            );
            newCertification = undefined;
            newNftTokenId = undefined;
          }
        }

        await traderDoc.ref.update({
          averageRating: parseFloat(averageRating.toFixed(2)),
          reviewCount: reviews.length,
          certification: newCertification,
          nftTokenId: newNftTokenId,
        });
      }
    } catch (error) {
      console.error("Error calculating average rating:", error);
    }
  },
};
