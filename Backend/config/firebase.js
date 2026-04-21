import admin from "firebase-admin";
import 'dotenv/config';

let db;

function initializeFirebase() {
  if (admin.apps.length > 0) {
    return admin.firestore();
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });

  db = admin.firestore();

  console.log("✅ Firebase connected (ENV)");

  return db;
}

function getDb() {
  if (!db) return initializeFirebase();
  return db;
}

export { initializeFirebase, getDb };