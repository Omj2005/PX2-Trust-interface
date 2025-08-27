import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { auth, db } from '@/lib/firebase';

export function FirebaseStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [firebaseAvailable, setFirebaseAvailable] = useState(true);

  useEffect(() => {
    // Check if Firebase is properly initialized
    setFirebaseAvailable(!!(auth && db));

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <Alert className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
        <WifiOff className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          No internet connection detected. Please check your network and try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (!firebaseAvailable) {
    return (
      <Alert className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          Running in demo mode. Full features require Firebase setup.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
