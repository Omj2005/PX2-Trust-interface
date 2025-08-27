import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Loader2, ArrowLeft, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TraderRegister() {
  const { loginWithMetaMask } = useAuth();
  const [isWalletRegistering, setIsWalletRegistering] = useState(false);
  const [error, setError] = useState<string>('');

  const handleMetaMaskRegister = async () => {
    setIsWalletRegistering(true);
    setError('');
    try {
      await loginWithMetaMask();
      // Redirect or show success message after successful MetaMask login/registration
    } catch (error: any) {
      console.error('MetaMask registration failed:', error);
      setError(error.message || 'MetaMask registration failed. Please try again.');
    } finally {
      setIsWalletRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-4">
      <div className="w-full max-w-md animate-fadeInUp">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-900 to-teal-600 dark:from-emerald-100 dark:to-teal-300 bg-clip-text text-transparent mb-2">
            Trader Registration
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Join our platform and start your trading journey
          </p>
        </div>

        <Card className="p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-emerald-200/50 dark:border-emerald-700/50 shadow-xl">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          <Button
            type="button"
            onClick={handleMetaMaskRegister}
            className="w-full hover:scale-105 transition-transform duration-200 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            disabled={isWalletRegistering}
          >
            {isWalletRegistering ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting Wallet...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Sign up with Wallet
              </>
            )}
          </Button>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Already have an account?
            </p>
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
