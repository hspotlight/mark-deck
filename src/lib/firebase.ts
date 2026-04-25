import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Firebase client SDK must only initialize in the browser.
// During Next.js SSR/prerendering there are no valid env vars and
// getAuth() throws auth/invalid-api-key.
const isClient = typeof window !== "undefined";

const app = isClient
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : (null! as ReturnType<typeof getApp>);

const auth = isClient ? getAuth(app) : (null! as ReturnType<typeof getAuth>);
const db = isClient
  ? getFirestore(app)
  : (null! as ReturnType<typeof getFirestore>);
const storage = isClient
  ? getStorage(app)
  : (null! as ReturnType<typeof getStorage>);
const functions = isClient
  ? getFunctions(app)
  : (null! as ReturnType<typeof getFunctions>);

export { app, auth, db, storage, functions };
