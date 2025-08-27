import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  signInAnonymously,
  signInWithCustomToken
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { userService } from '@/lib/firestore';
import { ethers } from 'ethers';

export type UserRole = 'user' | 'trader';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  walletAddress?: string;
  averageReviews?: number;
  certification?: string;
  nftTokenId?: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  loginWithMetaMask: (role: UserRole) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseAvailable, setIsFirebaseAvailable] = useState(true);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (newFirebaseUser) => {
      console.log('onAuthStateChanged: newFirebaseUser', newFirebaseUser);
      setFirebaseUser(newFirebaseUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    console.log('login: start');
    setIsLoading(true);

    if (role === 'trader') {
      throw new Error('Trader accounts can only log in with MetaMask.');
    }

    try {
      // If Firebase is not available, use fallback authentication
      if (!isFirebaseAvailable || !auth) {
        console.log('Using fallback authentication');

        // Simple fallback authentication
        if (email && password.length >= 6) {
          const fallbackUser: User = {
            id: `fallback_${Date.now()}`,
            name: role === 'trader' ? 'Demo Trader' : 'Demo User',
            email,
            role
          };

          setUser(fallbackUser);
          localStorage.setItem('auth_fallback', JSON.stringify({ user: fallbackUser }));
          setIsLoading(false);
          console.log('login: fallback success');
          return;
        } else {
          throw new Error('Please enter a valid email and password (minimum 6 characters)');
        }
      }

      // Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      setFirebaseUser(firebaseUser);
      console.log('login: firebaseUser set', firebaseUser);

      try {
        // Check if user exists in the correct collection
        console.log('login: Attempting to get user data from Firestore for UID:', firebaseUser.uid, 'with role:', role);
        const userData = await userService.getUser(firebaseUser.uid, role);
        
        if (!userData) {
          console.warn('login: User data not found in Firestore for UID:', firebaseUser.uid, 'and role:', role, '. Signing out.');
          await signOut(auth);
          throw { code: 'auth/user-not-found' };
        } else if (userData.role !== role) {
          // User exists but in wrong collection, not allowed
          console.warn('login: User exists but role mismatch. Expected:', role, 'Actual:', userData.role, '. Signing out.');
          await signOut(auth);
          throw new Error(`This account is registered as a ${userData.role}, not a ${role}`);
        } else {
          // User exists and role is correct, set the user in the context
          setUser(userData);
          console.log('login: User data successfully retrieved and set:', userData);
        }
      } catch (firestoreError) {
        console.warn('Firestore error, using basic auth:', firestoreError);
        // If Firestore fails, just use basic Firebase auth
        const basicUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || (role === 'trader' ? 'Trader User' : 'Regular User'),
          email: firebaseUser.email || email,
          role
        };
        setUser(basicUser);
        console.log('login: basic user data set', basicUser);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
      console.log('login: end');
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole): Promise<void> => {
    console.log('register: start');
    setIsLoading(true);

    if (role === 'trader') {
      throw new Error('Trader accounts can only be created with MetaMask.');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      setFirebaseUser(firebaseUser);
      console.log('register: firebaseUser set', firebaseUser);

      // Save user data to appropriate Firestore collection
      const userData: Partial<UserData> = {
        name,
        email: firebaseUser.email || email,
        role,
        createdAt: new Date().toISOString(),
      };

      if (role === 'trader') {
        userData.followers = 0;
        userData.performance = '+0.0%';
        userData.specialty = 'New Trader';
      }

      await userService.createUser(firebaseUser.uid, userData as Omit<UserData, 'id'>);
      const userWithId = { ...userData, id: firebaseUser.uid };
      setUser(userWithId);
      console.log('register: user data set', userWithId);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
      console.log('register: end');
    }
  };

  const loginWithMetaMask = async (role: UserRole) => {
    console.log('loginWithMetaMask: start');
    setIsLoading(true);

    if (role === 'user') {
      throw new Error('User accounts cannot log in with MetaMask.');
    }

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();
      console.log('loginWithMetaMask: walletAddress', walletAddress);

      // Define the message to be signed (must match backend)
      const messageToSign = "Sign in to Quantum Forge with your wallet";
      const signedMessage = await signer.signMessage(messageToSign);

      let userData: User | null = null; // Declare userData once here

      // Scenario 1: User is already logged in via email/password
      if (firebaseUser && user) {
        console.log('loginWithMetaMask: User already logged in, linking wallet.');
        // Update the existing user's Firestore document with the wallet address
        await userService.updateUser(firebaseUser.uid, { walletAddress }, user.role);
        // Update the local user state
        setUser({ ...user, walletAddress });
        console.log('loginWithMetaMask: Wallet linked to existing user.', user.id);
        return; // Exit after linking
      }

      // Scenario 2: No user is logged in, attempt to log in via backend for custom token
      console.log('loginWithMetaMask: Attempting to authenticate via backend for custom token.');
      const response = await fetch('/api/auth/metamask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress, signedMessage }),
      });

      const data = await response.json();

      if (response.ok) {
        const { customToken } = data;
        console.log('loginWithMetaMask: Received custom token, signing in to Firebase.');
        const userCredential = await signInWithCustomToken(auth, customToken);
        setFirebaseUser(userCredential.user);

        // Fetch user data from Firestore after successful custom token sign-in
        // Assuming the user's UID is the same as their Firestore document ID
        const fetchedUser = await userService.getUser(userCredential.user.uid);
        if (fetchedUser) {
          setUser(fetchedUser);
          console.log('loginWithMetaMask: User data fetched and set from Firestore.', fetchedUser);
        } else {
          // This case should ideally not happen if backend found a user and issued a token
          console.warn('loginWithMetaMask: User data not found in Firestore after custom token sign-in.');
          // Fallback to basic user data if Firestore data is missing
          setUser({
            id: userCredential.user.uid,
            name: userCredential.user.displayName || walletAddress,
            email: userCredential.user.email || '',
            role: 'trader', // Default role if not found
            walletAddress,
          });
        }
      } else {
        throw new Error(data.error || 'Unknown authentication error from backend.');
      }

    } catch (error: any) {
      console.error('MetaMask login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
      console.log('loginWithMetaMask: end');
    }
  };

  const logout = async (): Promise<void> => {
    console.log('logout: start');
    try {
      if (auth) {
        await signOut(auth);
      }

      // Clear fallback auth
      localStorage.removeItem('auth_fallback');
      setUser(null);
      setFirebaseUser(null);
      console.log('logout: success');
    } catch (error) {
      console.error('Error signing out:', error);
      // Force logout
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('auth_fallback');
      console.log('logout: forced logout');
    }
  };

  const value = {
    user,
    firebaseUser,
    isAuthenticated: !!firebaseUser,
    login,
    register,
    logout,
    loginWithMetaMask,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};