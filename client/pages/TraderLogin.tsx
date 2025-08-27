import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TraderLogin() {
  const { loginWithMetaMask, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleMetaMaskLogin = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await loginWithMetaMask();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="animate-fadeInUp">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600 dark:text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-4">
      <div className="w-full max-w-md animate-fadeInUp">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-900 to-teal-600 dark:from-emerald-100 dark:to-teal-300 bg-clip-text text-transparent mb-2">
            Trader Login
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Access your trading dashboard and manage your portfolio
          </p>
        </div>

        <Card className="p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-emerald-200/50 dark:border-emerald-700/50 shadow-xl">
          <div className="mb-6 p-4 rounded-lg border-2 border-dashed bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-300 dark:border-emerald-600">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Trader Access
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Advanced trading tools, portfolio management, and market analysis
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          <Button
            onClick={handleMetaMaskLogin}
            className="w-full hover:scale-105 transition-transform duration-200 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <img src="/images/metamask.svg" alt="MetaMask" className="mr-2 h-6 w-6" />
            )}
            Login with MetaMask
          </Button>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Don't have an account? <Link to="/register/trader" className="text-emerald-600 dark:text-emerald-400 hover:underline">Create one now</Link>.
            </p>
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to login options
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}