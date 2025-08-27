import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserRole } from '@/contexts/AuthContext';

// User data structure
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
}

// Trading data structure
export interface TradeData {
  id: string;
  userId: string;
  symbol: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: string;
  status: 'pending' | 'completed' | 'cancelled';
}

// Portfolio data structure
export interface PortfolioData {
  id: string;
  userId: string;
  totalValue: number;
  dailyPnL: number;
  positions: {
    symbol: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
  }[];
  lastUpdated: string;
}

// User operations (separate collections for users and traders)
export const userService = {
  // Get user by ID (checks both collections)
  async getUser(userId: string, role?: UserRole): Promise<UserData | null> {
    try {
      // Check if database is available
      if (!db) {
        console.warn('Database not available, returning null');
        return null;
      }

      let userDoc;

      if (role === 'trader') {
        userDoc = await getDoc(doc(db, 'traders', userId));
      } else if (role === 'user') {
        userDoc = await getDoc(doc(db, 'users', userId));
      } else {
        // Try both collections if role is not specified
        userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
          userDoc = await getDoc(doc(db, 'traders', userId));
        }
      }

      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as UserData;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      // Don't throw error, return null to allow fallback behavior
      return null;
    }
  },

  // Get user by wallet address (from traders collection only)
  async getUserByWalletAddress(walletAddress: string): Promise<UserData | null> {
    try {
      const q = query(
        collection(db, 'traders'),
        where('walletAddress', '==', walletAddress),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() } as UserData;
      }
      return null;
    } catch (error) {
      console.error('Error getting user by wallet address:', error);
      return null;
    }
  },

  // Update user data in appropriate collection
  async updateUser(userId: string, data: Partial<UserData>, role: UserRole): Promise<void> {
    try {
      const collection_name = role === 'trader' ? 'traders' : 'users';
      await updateDoc(doc(db, collection_name, userId), data);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Create user in appropriate collection
  async createUser(userId: string, userData: Omit<UserData, 'id'>): Promise<void> {
    try {
      if (!db) {
        console.warn('Database not available, skipping user creation');
        return;
      }

      const collection_name = userData.role === 'trader' ? 'traders' : 'users';
      console.log(`Attempting to create user document for UID: ${userId} in collection: ${collection_name} with data:`, userData);
      await setDoc(doc(db, collection_name, userId), userData);
      console.log(`Successfully created user document for UID: ${userId}`);
    } catch (error) {
      console.error('Error creating user:', error);
      // Don't throw error to allow fallback authentication
      console.warn('Continuing without database user creation');
    }
  },

  // Get popular traders (from traders collection only)
  async getPopularTraders(limitCount: number = 10): Promise<UserData[]> {
    try {
      const q = query(
        collection(db, 'traders'),
        orderBy('followers', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        role: 'trader' as UserRole
      })) as UserData[];
    } catch (error) {
      console.error('Error getting popular traders:', error);
      // Return mock data if Firestore query fails
      return [];
    }
  },

  // Get all users (from users collection only)
  async getAllUsers(limitCount: number = 50): Promise<UserData[]> {
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        role: 'user' as UserRole
      })) as UserData[];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  },

  // Follow/unfollow trader (users following traders)
  async followTrader(userId: string, traderId: string): Promise<void> {
    try {
      // Add to user's following list
      const userFollowingRef = doc(db, 'userFollowing', `${userId}_${traderId}`);
      await setDoc(userFollowingRef, {
        userId,
        traderId,
        followedAt: Timestamp.now()
      });

      // Update trader's follower count
      const traderDoc = await getDoc(doc(db, 'traders', traderId));
      if (traderDoc.exists()) {
        const currentFollowers = traderDoc.data().followers || 0;
        await updateDoc(doc(db, 'traders', traderId), {
          followers: currentFollowers + 1
        });
      }
    } catch (error) {
      console.error('Error following trader:', error);
      throw error;
    }
  }
};

// Trading operations
export const tradingService = {
  // Get user's trades
  async getUserTrades(userId: string, limitCount: number = 50): Promise<TradeData[]> {
    try {
      const q = query(
        collection(db, 'trades'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TradeData[];
    } catch (error) {
      console.error('Error getting user trades:', error);
      return [];
    }
  },

  // Create new trade
  async createTrade(tradeData: Omit<TradeData, 'id'>): Promise<string> {
    try {
      const tradesRef = collection(db, 'trades');
      const docRef = doc(tradesRef);
      await setDoc(docRef, {
        ...tradeData,
        timestamp: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating trade:', error);
      throw error;
    }
  }
};

// Portfolio operations
export const portfolioService = {
  // Get user's portfolio
  async getUserPortfolio(userId: string): Promise<PortfolioData | null> {
    try {
      const portfolioDoc = await getDoc(doc(db, 'portfolios', userId));
      if (portfolioDoc.exists()) {
        return { id: portfolioDoc.id, ...portfolioDoc.data() } as PortfolioData;
      }
      return null;
    } catch (error) {
      console.error('Error getting portfolio:', error);
      return null;
    }
  },

  // Update portfolio
  async updatePortfolio(userId: string, portfolioData: Partial<PortfolioData>): Promise<void> {
    try {
      await setDoc(doc(db, 'portfolios', userId), {
        ...portfolioData,
        lastUpdated: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating portfolio:', error);
      throw error;
    }
  }
};
