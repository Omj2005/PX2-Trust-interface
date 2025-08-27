import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo.ts";

import { handleMetaMaskAuth } from "./routes/authMetaMask.ts";
import tradersRouter from "./routes/traders.ts";
import reviewsRouter from "./routes/reviews.ts";
import { initializeFirestore } from "./lib/firestore.ts";

const app = express();
const PORT = process.env.PORT || 3001;

console.log("GOOGLE_APPLICATION_CREDENTIALS in server/index.ts:", process.env.GOOGLE_APPLICATION_CREDENTIALS);

initializeFirestore();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Example API routes
app.get("/api/ping", (_req, res) => {
  const ping = process.env.PING_MESSAGE ?? "ping";
  res.json({ message: ping });
});

app.get("/api/demo", handleDemo);

// New route for MetaMask authentication
app.post("/api/auth/metamask", handleMetaMaskAuth); // Add the new POST route

// New route for searching traders
app.use('/api/traders', tradersRouter);
app.use('/api/reviews', reviewsRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
