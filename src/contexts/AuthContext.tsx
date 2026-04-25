"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  type User as FirebaseUser,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { ensureUserDocument, handleMigration } from "@/modules/auth-module";
import type { UserProfile } from "@/types";

export interface AuthContextValue {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function fetchUserProfile(uid: string) {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      setUserProfile({ id: snap.id, ...(snap.data() as Omit<UserProfile, "id">) });
    }
  }

  async function refreshUserProfile() {
    if (user) await fetchUserProfile(user.uid);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await ensureUserDocument(firebaseUser);
        try {
          await handleMigration(firebaseUser);
        } catch {
          // Leave sessionStorage intact so the user can retry
        }
        await fetchUserProfile(firebaseUser.uid);
      } else {
        setUserProfile(null);
      }
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  async function signInWithEmail(
    email: string,
    password: string
  ): Promise<void> {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signUpWithEmail(
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<void> {
    if (password !== confirmPassword) {
      const err = new Error("Passwords do not match.") as Error & {
        code: string;
      };
      err.code = "auth/passwords-do-not-match";
      throw err;
    }
    await createUserWithEmailAndPassword(auth, email, password);
  }

  async function signOut(): Promise<void> {
    await firebaseSignOut(auth);
    setUserProfile(null);
    router.push("/");
  }

  async function sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        sendPasswordReset,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
