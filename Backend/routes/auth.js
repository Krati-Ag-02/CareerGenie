import express from "express";
const router = express.Router();

import bcrypt from "bcryptjs";
import { getDb } from "../config/firebase.js";


// ───────────────── REGISTER ─────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const emailClean = email.toLowerCase().trim();
    const db = getDb();

    // Check if email already exists
    const existing = await db.collection("users").where("email", "==", emailClean).limit(1).get();
    if (!existing.empty) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const docRef = await db.collection("users").add({
      name: name.trim(),
      email: emailClean,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    });

    const userId = docRef?.name?.split('/').pop() || docRef?.id;

    req.session.userId = userId;
    req.session.userName = name.trim();
    req.session.userEmail = emailClean;

    res.status(201).json({
      message: "Account created successfully",
      user: { id: userId, name: name.trim(), email: emailClean },
    });

  } catch (err) {
    console.error("[AUTH] Register error:", err);
    res.status(500).json({ error: "Registration failed." });
  }
});


// ───────────────── LOGIN ─────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const emailClean = email.toLowerCase().trim();
    const db = getDb();

    const snapshot = await db
      .collection("users")
      .where("email", "==", emailClean)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const docSnap = snapshot.docs[0];
    const userData = docSnap.data();
    const userId = docSnap.id;

    const isMatch = await bcrypt.compare(password, userData.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    req.session.userId = userId;
    req.session.userName = userData.name;
    req.session.userEmail = userData.email;

    res.json({
      message: "Login successful",
      user: {
        id: userId,
        name: userData.name,
        email: userData.email,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Login failed." });
  }
});


// ───────────────── LOGOUT ─────────────────
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("careergenie.sid");
    res.json({ message: "Logged out successfully." });
  });
});


// ───────────────── ME ─────────────────
router.get("/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  res.json({
    user: {
      id: req.session.userId,
      name: req.session.userName,
      email: req.session.userEmail,
    },
  });
});

export default router;