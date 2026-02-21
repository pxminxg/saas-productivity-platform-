import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js"; // ✅ NEW

import { requireAuth } from "./middleware/auth.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Auth routes
app.use("/auth", authRoutes);

// Task routes (protected inside tasks router using requireAuth)
app.use("/tasks", taskRoutes);

// Test route to check token -> user
app.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
