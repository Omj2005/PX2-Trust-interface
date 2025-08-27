import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo.ts";
import { handleMetaMaskAuth } from "./routes/authMetaMask.ts";
import tradersRouter from "./routes/traders.ts";
import reviewsRouter from "./routes/reviews.ts";
import { initializeFirestore } from "./lib/firestore.ts";

export function createServer() {
  const app = express();

  initializeFirestore();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/auth/metamask", handleMetaMaskAuth);
  app.use("/api/traders", tradersRouter);
  app.use("/api/reviews", reviewsRouter);

  return app;
}
