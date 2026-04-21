import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";

dotenv.config();

import { initializeFirebase } from './config/firebase.js';
import authRoutes from "./routes/auth.js";
import aiRoutes from "./routes/ai.js";

const app = express();
const PORT = process.env.PORT || 5000;
 
// Init Firebase REST client
initializeFirebase();
 
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
 
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
 
app.use(session({
  name: 'careergenie.sid',
  secret: process.env.SESSION_SECRET || 'fallback_dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  },
}));
 
app.use('/api/auth', authRoutes);
app.use('/api', aiRoutes);
 
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
 
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});
 
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ error: 'Internal server error.' });
});
 
app.listen(PORT, () => {
  console.log(`\n🚀 CareerGenie Backend → http://localhost:${PORT}`);
  console.log(`🌍 Accepting requests from: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n`);
});
 