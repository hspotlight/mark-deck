/**
 * Seed script for Firebase Emulator Suite.
 * Populates Firestore and Storage with fixture data for E2E tests.
 *
 * Usage: npm run seed
 * Requires: Firebase Emulator running (npm run emulators)
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
  setDoc,
  doc,
} from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const app = initializeApp({
  apiKey: "demo-api-key",
  authDomain: "demo-mark-deck.firebaseapp.com",
  projectId: "demo-mark-deck",
  storageBucket: "demo-mark-deck.appspot.com",
});

const db = getFirestore(app);
const auth = getAuth(app);

connectFirestoreEmulator(db, "localhost", 8080);
connectAuthEmulator(auth, "http://localhost:9099");

async function seed() {
  console.log("Seeding Firestore with fixture data...");

  // Seed a public deck for E2E tests
  await setDoc(doc(db, "decks", "fixture-deck-1"), {
    title: "Fixture Deck",
    content: "# Slide 1\n\n---\n\n# Slide 2",
    visibility: "public",
    ownerId: "fixture-user-1",
    ownerUsername: "testuser",
    slug: "fixture-deck",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: 0,
    downloads: 0,
  });

  // Seed a user profile
  await setDoc(doc(db, "users", "fixture-user-1"), {
    username: "testuser",
    email: "test@example.com",
    createdAt: new Date().toISOString(),
    deckCount: 1,
    storageUsed: 0,
    plan: "free",
  });

  console.log("Seed complete.");
}

seed().catch(console.error);
