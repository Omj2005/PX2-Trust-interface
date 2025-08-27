import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, LogIn, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserLogin() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await login(email, password, 'user');
    } catch (error: any) {
      console.error('User login failed:', error);
      
      if (error.code === 'auth/user-not-found') {
        setError('Account not found. Please create an account.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError('User login failed. Please try again.');
      }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-4">
      <div className="w-full max-w-md animate-fadeInUp">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-indigo-600 dark:from-blue-100 dark:to-indigo-300 bg-clip-text text-transparent mb-2">
            User Login
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Access your user dashboard and explore trading insights
          </p>
        </div>

        <Card className="p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-blue-200/50 dark:border-blue-700/50 shadow-xl">
          <div className="mb-6 p-4 rounded-lg border-2 border-dashed bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-300 dark:border-blue-600">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <User className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                User Access
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Browse popular traders, view market insights, and manage your profile
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="transition-all duration-200 focus:scale-[1.02]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="transition-all duration-200 focus:scale-[1.02]"
              />
            </div>

            <Button
              type="submit"
              className="w-full hover:scale-105 transition-transform duration-200 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              disabled={isSubmitting || !email || !password}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in as User
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Don't have an account? <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline">Create one now</Link>.
            </p>
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
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
