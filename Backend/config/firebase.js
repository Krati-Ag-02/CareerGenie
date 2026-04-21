
import { createRequire } from "module";
import 'dotenv/config';
import admin from "firebase-admin";

const require = createRequire(import.meta.url);

let db;

function initializeFirebase() {
  if (admin.apps.length > 0) return admin.app();

  let credential;

  try {
    const serviceAccount = require("./serviceAccountKey.json");
    credential = admin.credential.cert(serviceAccount);
    console.log("🔑 Using serviceAccountKey.json");
  } catch {
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n").replace(/"/g, ''),
    });
    console.log("🔑 Using env credentials");
  }

  admin.initializeApp({ credential });
  console.log("✅ Firebase Admin ready");
  return admin.app();
}

function getDb() {
  if (!db) {
    initializeFirebase();
    db = admin.firestore();
  }
  return db;
}

export { initializeFirebase, getDb };