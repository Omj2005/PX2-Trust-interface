import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, TrendingUp, Loader2, ArrowRight, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login() {
  const { isLoading } = useAuth();

  const loginOptions = [
    {
      type: 'user',
      label: 'User Login',
      icon: User,
      description: 'Browse popular traders, view market insights, and manage your profile',
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
      href: '/login/user'
    },
    {
      type: 'trader',
      label: 'Trader Login',
      icon: TrendingUp,
      description: 'Advanced trading tools, portfolio management, and market analysis',
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
      href: '/login/trader'
    }
  ];

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-2xl animate-fadeInUp">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-4">
            Welcome Back
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Choose your account type to continue
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loginOptions.map((option, index) => (
            <Card 
              key={option.type}
              className="p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fadeInUp"
              style={{
                animationDelay: `${index * 200}ms`
              }}
            >
              <div className={`p-6 rounded-lg border-2 border-dashed bg-gradient-to-br ${option.bgGradient} border-slate-300 dark:border-slate-600 mb-6`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-4 rounded-full bg-gradient-to-br ${option.gradient} text-white`}>
                    <option.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {option.label}
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {option.description}
                </p>
              </div>

              <Button 
                asChild
                className={`w-full hover:scale-105 transition-transform duration-200 bg-gradient-to-r ${option.gradient} hover:opacity-90 text-lg py-6`}
              >
                <Link to={option.href}>
                  Continue as {option.type === 'user' ? 'User' : 'Trader'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            New to our platform? Create an account to get started.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline" className="hover:scale-105 transition-transform duration-200">
              <Link to="/register">
                <UserPlus className="mr-2 h-4 w-4" />
                Create User Account
              </Link>
            </Button>
            <Button asChild variant="outline" className="hover:scale-105 transition-transform duration-200">
              <Link to="/register/trader">
                <UserPlus className="mr-2 h-4 w-4" />
                Create Trader Account
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
