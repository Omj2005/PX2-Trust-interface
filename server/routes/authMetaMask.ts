import { Request, Response } from 'express';
import { ethers } from 'ethers';
import * as admin from 'firebase-admin';
import { userService } from '../lib/firestore'; // Import from server-side lib

export const handleMetaMaskAuth = async (req: Request, res: Response) => {
  console.log('handleMetaMaskAuth: Start');
  try {
    const { walletAddress, signedMessage } = req.body;
    console.log('handleMetaMaskAuth: Received walletAddress', walletAddress, 'and signedMessage', signedMessage);

    if (!walletAddress || !signedMessage) {
      console.log('handleMetaMaskAuth: Missing walletAddress or signedMessage');
      return res.status(400).json({ error: 'Missing walletAddress or signedMessage' });
    }

    // Define the message that was signed on the client side
    const messageToSign = "Sign in to Quantum Forge with your wallet"; // This must match the client-side message

    // Recover the address from the signed message
    console.log('handleMetaMaskAuth: Verifying message signature');
    const recoveredAddress = ethers.verifyMessage(messageToSign, signedMessage);
    console.log('handleMetaMaskAuth: Recovered address', recoveredAddress);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      console.log('handleMetaMaskAuth: Signature verification failed');
      return res.status(401).json({ error: 'Signature verification failed: Addresses do not match.' });
    }

    // Find the user in Firestore by wallet address
    console.log('handleMetaMaskAuth: Searching for user by wallet address', walletAddress);
    const user = await userService.getUserByWalletAddress(walletAddress);
    console.log('handleMetaMaskAuth: User found', user);

    if (!user) {
      console.log('handleMetaMaskAuth: User not found, creating new user');
      // If no user found, create a new Firebase user and link the wallet address
      const newUserRecord = await admin.default.auth().createUser({
        displayName: walletAddress, // Or a generated name
      });
      const newUid = newUserRecord.uid;
      console.log('handleMetaMaskAuth: New Firebase user created with UID', newUid);

      const newUserData = {
        name: walletAddress, // Default name
        email: '', // No email for wallet-only sign-up initially
        role: 'trader', // Default to trader for wallet sign-ups
        walletAddress,
        createdAt: new Date().toISOString(),
        averageReviews: 0, // Initialize averageReviews for new traders
      };
      console.log('handleMetaMaskAuth: Creating user data in Firestore', newUserData);
      await userService.createUser(newUid, newUserData);
      console.log('handleMetaMaskAuth: User data created in Firestore');
      
      // Generate a custom token for the newly created user
      console.log('handleMetaMaskAuth: Creating custom token for new user', newUid);
      const firebaseCustomToken = await admin.default.auth().createCustomToken(newUid);
      console.log('handleMetaMaskAuth: Custom token created');
      return res.status(200).json({ customToken: firebaseCustomToken });
    }

    // Generate a Firebase Custom Token for the found user
    console.log('handleMetaMaskAuth: User found, creating custom token for existing user', user.id);
    const firebaseCustomToken = await admin.default.auth().createCustomToken(user.id);
    console.log('handleMetaMaskAuth: Custom token created');

    res.status(200).json({ customToken: firebaseCustomToken });

  } catch (error: any) {
    console.error('MetaMask authentication error:', error);
    res.status(500).json({ error: 'Internal server error during MetaMask authentication.', details: error.message });
  }
};