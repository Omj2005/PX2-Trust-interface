import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { ReviewForm } from '@/components/ReviewForm';
import { useAuth } from '@/contexts/AuthContext';

interface TraderProfileData {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  averageRating?: number;
  reviewCount?: number;
  certification?: string;
  specialty?: string;
  performance?: string;
  followers?: number;
}

interface Review {
  id: string;
  reviewerWalletAddress: string;
  rating: number;
  comment: string;
  timestamp: { toDate: () => Date };
}

export default function TraderProfile() {
  const { walletAddress } = useParams<{ walletAddress: string }>();
  const { user } = useAuth();
  const [trader, setTrader] = useState<TraderProfileData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTraderData = async () => {
    try {
      const traderResponse = await fetch(`/api/traders/search?walletAddress=${walletAddress}`);
      if (!traderResponse.ok) {
        throw new Error(`HTTP error! status: ${traderResponse.status}`);
      }
      const traderData = await traderResponse.json();
      if (traderData && traderData.length > 0) {
        setTrader(traderData[0]);
      } else {
        setTrader(null);
      }

      const reviewsResponse = await fetch(`/api/reviews/${walletAddress}`);
      if (!reviewsResponse.ok) {
        throw new Error(`HTTP error! status: ${reviewsResponse.status}`);
      }
      const reviewsData = await reviewsResponse.json();
      setReviews(reviewsData);

    } catch (e: any) {
      setError(e.message);
      console.error("Error fetching trader data or reviews:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchTraderData();
    }
  }, [walletAddress]);

  const handleReviewSubmitted = () => {
    // Re-fetch reviews after a new one is submitted
    fetchTraderData();
  };

  if (loading) {
    return <DashboardLayout><div className="p-8 text-center">Loading trader profile...</div></DashboardLayout>;
  }

  if (error) {
    return <DashboardLayout><div className="p-8 text-center text-red-500">Error: {error}</div></DashboardLayout>;
  }

  if (!trader) {
    return <DashboardLayout><div className="p-8 text-center">Trader not found.</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="text-3xl">{trader.name ? trader.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'TR'}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl font-bold">{trader.name || 'Trader'}</CardTitle>
              <p className="text-sm text-gray-500">{trader.walletAddress}</p>
              {trader.specialty && <Badge variant="secondary" className="mt-2">{trader.specialty}</Badge>}
            </div>
            <div className="ml-auto text-right">
              {trader.averageRating !== undefined && (
                <div className="flex items-center justify-end text-xl font-semibold">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-1" />
                  {trader.averageRating.toFixed(1)}
                </div>
              )}
              {trader.reviewCount !== undefined && (
                <p className="text-sm text-gray-500">({trader.reviewCount} reviews)</p>
              )}
              {trader.certification && (
                <Badge className="mt-2 text-white" style={{ backgroundColor: trader.certification === 'Gold' ? '#FFD700' : trader.certification === 'Silver' ? '#C0C0C0' : '#CD7F32' }}>
                  {trader.certification} Certified
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Performance:</p>
                <p className="font-medium">{trader.performance || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Followers:</p>
                <p className="font-medium">{trader.followers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {user && user.role === 'user' && user.walletAddress && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Leave a Review</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewForm
                traderWalletAddress={trader.walletAddress}
                reviewerWalletAddress={user.walletAddress}
                onReviewSubmitted={handleReviewSubmitted}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Reviews ({reviews.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <p className="text-center text-gray-500">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center mb-2">
                      <Avatar className="w-8 h-8 mr-2">
                        <AvatarFallback>{review.reviewerWalletAddress.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{review.reviewerWalletAddress}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          {[...Array(5 - review.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-gray-300" />
                          ))}
                          <span className="ml-2">{review.rating.toFixed(1)} out of 5</span>
                        </div>
                      </div>
                      <span className="ml-auto text-xs text-gray-400">
                        {review.timestamp.toDate().toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}