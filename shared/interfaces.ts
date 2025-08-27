export interface Review {
  reviewerUid: string; // UID of the user leaving the review
  reviewerName: string; // Name of the user leaving the review
  rating: number; // 1-5 stars
  comment: string;
  timestamp: string; // ISO string
}
