import admin from "firebase-admin";
import fs from "fs";
import path from "path";

let db;

function initializeFirebase() {
  if (admin.apps.length > 0) {
    return admin.firestore();
  }

  // 🔥 ALWAYS use JSON file (NO fallback)
  const filePath = path.resolve("./config/serviceAccountKey.json");

  if (!fs.existsSync(filePath)) {
    throw new Error("❌ serviceAccountKey.json NOT found in /config folder");
  }

  const serviceAccount = JSON.parse(
    fs.readFileSync(filePath, "utf-8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  db = admin.firestore();

  console.log("✅ Firebase connected (FINAL)");

  return db;
}

function getDb() {
  if (!db) return initializeFirebase();
  return db;
}

export { initializeFirebase, getDb };