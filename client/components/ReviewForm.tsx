import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface ReviewFormProps {
  traderWalletAddress: string;
  reviewerWalletAddress: string;
  onReviewSubmitted: () => void;
}

export function ReviewForm({
  traderWalletAddress,
  reviewerWalletAddress,
  onReviewSubmitted,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a star rating.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          traderWalletAddress,
          reviewerWalletAddress,
          rating,
          comment,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Review submitted successfully!",
        });
        setRating(0);
        setComment('');
        onReviewSubmitted(); // Callback to refresh reviews on parent
      } else {
        const errorData = await response.json();
        toast({
          title: "Submission Failed",
          description: errorData.error || "Failed to submit review.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="rating" className="mb-2 block">Rating</Label>
        <div className="flex space-x-1" id="rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "w-8 h-8 cursor-pointer",
                rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
              )}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="comment">Comment</Label>
        <Textarea
          id="comment"
          placeholder="Share your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="mt-1"
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
