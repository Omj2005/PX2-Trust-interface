// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDCrQATOoFS3EOE3JWnY7IhMQxs6SzvCOM",
  authDomain: "px2-trust.firebaseapp.com",
  projectId: "px2-trust",
  storageBucket: "px2-trust.firebasestorage.app",
  messagingSenderId: "368285193229",
  appId: "1:368285193229:web:3de9c755a83d1b609bf144",
  measurementId: "G-VF0DC7HC3B"
};

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId'];
  for (const field of requiredFields) {
    if (!firebaseConfig[field as keyof typeof firebaseConfig]) {
      console.error(`Firebase configuration missing: ${field}`);
      return false;
    }
  }
  return true;
};

// Initialize Firebase
let app;
let auth;
let db;
let analytics = null;

try {
  if (validateFirebaseConfig()) {
    app = initializeApp(firebaseConfig);

    // Initialize Firebase Authentication and get a reference to the service
    auth = getAuth(app);

    // Initialize Cloud Firestore and get a reference to the service
    db = getFirestore(app);

    // Initialize Analytics (only in browser environment)
    if (typeof window !== 'undefined') {
      try {
        analytics = getAnalytics(app);
      } catch (analyticsError) {
        console.warn('Analytics initialization failed:', analyticsError);
      }
    }

    console.log('Firebase initialized successfully');
  } else {
    throw new Error('Invalid Firebase configuration');
  }
} catch (error) {
  console.error('Firebase initialization failed:', error);

  // Create mock implementations for development
  console.warn('Using mock Firebase implementation for development');

  // These will be undefined, but we'll handle it in AuthContext
  auth = null;
  db = null;
}

export { auth, db, analytics };
export default app;
