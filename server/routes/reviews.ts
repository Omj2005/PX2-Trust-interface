import { Request, Response, Router } from 'express';
import { reviewService, userService } from '../lib/firestore';
import * as admin from "firebase-admin";

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { traderWalletAddress, reviewerWalletAddress, rating, comment } = req.body;

  if (!traderWalletAddress || !reviewerWalletAddress || rating === undefined || comment === undefined) {
    return res.status(400).json({ error: 'Missing required review fields.' });
  }

  try {
    const newReview = {
      traderWalletAddress,
      reviewerWalletAddress,
      rating,
      comment,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };
    await reviewService.addReview(newReview);
    await reviewService.calculateAverageRating(traderWalletAddress);
    res.status(201).json({ message: 'Review added successfully.' });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/:traderWalletAddress', async (req: Request, res: Response) => {
  const { traderWalletAddress } = req.params;

  if (!traderWalletAddress) {
    return res.status(400).json({ error: 'Trader wallet address is required.' });
  }

  try {
    const reviews = await reviewService.getReviewsByTraderWalletAddress(traderWalletAddress);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
