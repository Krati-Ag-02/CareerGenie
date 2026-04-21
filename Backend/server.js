import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";

dotenv.config();

import { initializeFirebase } from "./config/firebase.js";
import authRoutes from "./routes/auth.js";
import aiRoutes from "./routes/ai.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

// Initialize Firebase
initializeFirebase();

// CORS
app.use(cors({
  origin: [
    "https://careergenie-frontend.onrender.com",
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  credentials: true
}));

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 🔥 SESSION FIX (FINAL)
app.use(session({
  name: "careergenie.sid",
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,          
    httpOnly: true,
    sameSite: "none",      
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", aiRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Root route (fixes "route not found")
app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("[SERVER ERROR]", err);
  res.status(500).json({ error: "Internal server error." });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
   console.log(`🌍 Accepting requests from: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n`);
});
