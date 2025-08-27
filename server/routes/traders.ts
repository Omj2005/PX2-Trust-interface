import { Request, Response, Router } from 'express';
import { userService } from '../lib/firestore';

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
  const { walletAddress } = req.query;

  if (!walletAddress || typeof walletAddress !== 'string') {
    return res.status(400).json({ error: 'Wallet address is required.' });
  }

  try {
    const trader = await userService.getUserByWalletAddress(walletAddress);
    if (trader) {
      res.json([trader]); // Return as an array for consistency with potential multiple results
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error searching for trader:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
