import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users as UsersIcon, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TraderSearchResult {
  id: string;
  name: string;
  walletAddress: string;
  averageRating?: number;
  reviewCount?: number;
  certification?: string;
}

export default function Users() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TraderSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchQuery) {
      setSearchResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/traders/search?walletAddress=${searchQuery}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: TraderSearchResult[] = await response.json();
      setSearchResults(data);
    } catch (e: any) {
      console.error("Error searching for traders:", e);
      setError(`Failed to search for traders: ${e.message}`);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (walletAddress: string) => {
    navigate(`/trader-profile/${walletAddress}`);
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="text-center max-w-md mx-auto animate-fadeInUp">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <UsersIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Trader Search
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Search for trader wallets to view their profiles and reviews.
          </p>
          <Card className="p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <div className="flex space-x-2 mb-4">
              <Input
                type="text"
                placeholder="Enter trader wallet address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? 'Searching...' : <Search className="h-4 w-4" />}
              </Button>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            {searchResults.length > 0 && (
              <div className="mt-4 text-left">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Search Results:</h3>
                <ul className="space-y-2">
                  {searchResults.map((trader) => (
                    <li key={trader.id} className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-700 rounded-md shadow-sm">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{trader.name || 'Unnamed Trader'}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 break-all">{trader.walletAddress}</p>
                        {trader.averageRating !== undefined && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">Rating: {trader.averageRating.toFixed(2)} ({trader.reviewCount} reviews)</p>
                        )}
                        {trader.certification && (
                          <p className="text-xs text-blue-600 dark:text-blue-400">Certification: {trader.certification}</p>
                        )}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleResultClick(trader.walletAddress)}>
                        View Profile
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {searchResults.length === 0 && searchQuery && !loading && !error && (
              <p className="text-slate-500 dark:text-slate-400 mt-4">No traders found for "{searchQuery}".</p>
            )}

            {!searchQuery && !loading && searchResults.length === 0 && (
              <p className="text-slate-500 dark:text-slate-400 mt-4">Start typing a wallet address to search for traders.</p>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
