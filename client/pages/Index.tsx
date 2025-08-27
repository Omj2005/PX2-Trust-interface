import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { userService } from '@/lib/firestore';
import { TrendingUp, Users, Activity, DollarSign, BarChart3, LineChart, PieChart, Target, Star, Search, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

  

export default function Index() {
  const { user } = useAuth();
  const [firebaseTraders, setFirebaseTraders] = useState<any[]>([]);
  const [searchWalletAddress, setSearchWalletAddress] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!searchWalletAddress) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(`/api/traders/search?walletAddress=${searchWalletAddress}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        setSearchResults([]);
        console.error('Error searching traders:', response.statusText);
      }
    } catch (error) {
      setSearchResults([]);
      console.error('Error searching traders:', error);
    }
  };

  console.log('Index.tsx: user object', user);
  console.log('Index.tsx: user role', user?.role);

  const adminStats = [
    {
      name: 'Total Users',
      value: '12,345',
      change: '+12%',
      icon: Users,
      trend: 'up'
    },
    {
      name: 'Active Sessions',
      value: '1,234',
      change: '+8%',
      icon: Activity,
      trend: 'up'
    },
    {
      name: 'Revenue',
      value: '$45,678',
      change: '+15%',
      icon: DollarSign,
      trend: 'up'
    },
    {
      name: 'Growth Rate',
      value: '98.2%',
      change: '+2.4%',
      icon: TrendingUp,
      trend: 'up'
    }
  ];

  const traderStats = [
    {
      name: 'Average Reviews',
      value: '4.5',
      change: '+0.2',
      icon: Star,
      trend: 'up'
    },
    {
      name: 'Daily P&L',
      value: '+$2,345',
      change: '+8.2%',
      icon: TrendingUp,
      trend: 'up'
    },
    {
      name: 'Open Positions',
      value: '15',
      change: '+3',
      icon: BarChart3,
      trend: 'up'
    },
    {
      name: 'Success Rate',
      value: '87.5%',
      change: '+2.1%',
      icon: Target,
      trend: 'up'
    }
  ];

  const popularTraders = [
    {
      name: 'Vibha Rajput',
      performance: '+24.5%',
      followers: '2.1K',
      avatar: 'VR',
      specialty: 'Crypto Trading',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      name: 'Arpita',
      performance: '+18.7%',
      followers: '1.8K',
      avatar: 'A',
      specialty: 'Forex Expert',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      name: 'Ajay',
      performance: '+31.2%',
      followers: '3.4K',
      avatar: 'AJ',
      specialty: 'Stock Analysis',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      name: 'Om Jha',
      performance: '+22.8%',
      followers: '2.7K',
      avatar: 'OJ',
      specialty: 'Day Trading',
      gradient: 'from-orange-500 to-red-600'
    }
  ];

  const stats = user?.role === 'trader' ? traderStats : adminStats;

  // Dynamically update the 'Average Reviews' stat if user is a trader
  if (user?.role === 'trader' && user.averageReviews !== undefined) {
    const averageReviewsStat = stats.find(stat => stat.name === 'Average Reviews');
    if (averageReviewsStat) {
      averageReviewsStat.value = user.averageReviews.toFixed(1);
    }
  }

  // Fetch popular traders from Firebase on component mount
  useEffect(() => {
    const fetchPopularTraders = async () => {
      try {
        const traders = await userService.getPopularTraders(4);
        if (traders.length > 0) {
          setFirebaseTraders(traders);
        }
      } catch (error) {
        console.log('Using mock trader data - Firebase fetch failed:', error);
      }
    };

    if (user?.role === 'user') {
      fetchPopularTraders();
    }
  }, [user?.role]);

  // Use Firebase data if available, otherwise use mock data
  const displayTraders = popularTraders.map((mockTrader, index) => {
    const firebaseTrader = firebaseTraders[index];
    return {
      name: firebaseTrader?.name || mockTrader.name,
      performance: firebaseTrader?.performance || mockTrader.performance,
      followers: firebaseTrader?.followers ? `${(firebaseTrader.followers / 1000).toFixed(1)}K` : mockTrader.followers,
      avatar: (firebaseTrader?.name || mockTrader.name).split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      specialty: firebaseTrader?.specialty || mockTrader.specialty,
      gradient: mockTrader.gradient,
    };
  });

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fadeInUp">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Welcome, {user?.role === 'trader' ? 'Trader' : 'User'}!
            {user?.role === 'trader' ? ' 📈' : ' 👋'}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            {user?.role === 'trader'
              ? 'Track your portfolio performance, analyze market trends, and manage your trading positions all in one place. Your professional trading command center.'
              : 'Monitor your dashboard metrics, manage users, and oversee system performance all in one place. Your command center for efficient administration.'
            }
          </p>
        </div>

        {/* Popular Traders Section for Users / Stats Grid for Traders */}
        {user?.role === 'user' && (
          <div className="mb-8 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Search Traders
            </h2>
            <div className="flex space-x-2 mb-6">
              <Input
                type="text"
                placeholder="Search by Wallet Address"
                className="flex-grow"
                value={searchWalletAddress}
                onChange={(e) => setSearchWalletAddress(e.target.value)}
              />
              <Button onClick={handleSearch}>
                <Search className="h-5 w-5" />
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Search Results:</h3>
                {searchResults.map((trader: any) => (
                  <Card key={trader.id} className="p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
                    <Link to={`/trader-profile/${trader.walletAddress}`} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{trader.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{trader.walletAddress}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    </Link>
                  </Card>
                ))}
              </div>
            )}

            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Popular Traders
            </h2>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {user?.role === 'user' ? (
            // Popular Traders for Users
            displayTraders.map((trader, index) => (
              <Card
                key={trader.name}
                className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fadeInUp bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50"
                style={{
                  animationDelay: `${index * 150}ms`
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-full bg-gradient-to-br text-white flex items-center justify-center font-bold text-sm",
                    trader.gradient
                  )}>
                    {trader.avatar}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {trader.performance}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      30d return
                    </p>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {trader.name}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {trader.specialty}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {trader.followers} followers
                    </span>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Follow
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            // Stats for Traders
            stats.map((stat, index) => (
              <Card
                key={stat.name}
                className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fadeInUp bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50"
                style={{
                  animationDelay: `${index * 150}ms`
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  >
                    {stat.change}
                  </Badge>
                  <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">
                    vs last month
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6 animate-fadeInUp bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50" style={{ animationDelay: '600ms' }}>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              {user?.role === 'user' ? 'My Reviews' : 'Quick Actions'}
            </h3>
            <div className="space-y-3">
              {user?.role === 'trader' ? (
                <>
                  <Button className="w-full justify-start hover:scale-105 transition-transform duration-200">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Place New Trade
                  </Button>
                  <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform duration-200">
                    <LineChart className="mr-2 h-4 w-4" />
                    Market Analysis
                  </Button>
                  <Button variant="secondary" className="w-full justify-start hover:scale-105 transition-transform duration-200">
                    <PieChart className="mr-2 h-4 w-4" />
                    Portfolio Overview
                  </Button>
                </>
              ) : (
                <>
                  <Button className="w-full justify-start hover:scale-105 transition-transform duration-200">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                  <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform duration-200">
                    <Activity className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                  <Button variant="secondary" className="w-full justify-start hover:scale-105 transition-transform duration-200">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </>
              )}
            </div>
          </Card>

          <Card className="p-6 animate-fadeInUp bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50" style={{ animationDelay: '750ms' }}>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {user?.role === 'trader' ? (
                <>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        AAPL position opened (+$250)
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        Portfolio rebalanced
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        Market alert: Tech sector up 2.5%
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">2 hours ago</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Button className="w-full justify-start hover:scale-105 transition-transform duration-200">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                  <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform duration-200">
                    <Activity className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                  <Button variant="secondary" className="w-full justify-start hover:scale-105 transition-transform duration-200">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}


  
