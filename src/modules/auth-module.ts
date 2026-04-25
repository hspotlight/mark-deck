import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import type { User as FirebaseUser } from "firebase/auth";
import { db } from "@/lib/firebase";
import { createDeck } from "./deck-repository";

/**
 * Creates or updates the Firestore user document after sign-in.
 * - First sign-in: creates the full document with username: null.
 * - Subsequent sign-ins: merges only displayName and avatarUrl.
 */
export async function ensureUserDocument(user: FirebaseUser): Promise<void> {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      displayName:
        user.displayName ?? (user.email ? user.email.split("@")[0] : "User"),
      email: user.email,
      avatarUrl: user.photoURL ?? null,
      bio: "",
      storageUsedBytes: 0,
      createdAt: serverTimestamp(),
      username: null,
    });
  } else {
    await setDoc(
      userRef,
      {
        displayName:
          user.displayName ?? (user.email ? user.email.split("@")[0] : "User"),
        avatarUrl: user.photoURL ?? null,
      },
      { merge: true }
    );
  }
}

/**
 * Checks sessionStorage for pending anonymous editor content and migrates it
 * to a new Firestore deck owned by the newly authenticated user.
 * Returns the new deck ID, or null if no migration was needed.
 */
export async function handleMigration(
  user: FirebaseUser
): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const markdown = sessionStorage.getItem("pendingMigrationMarkdown");
  if (!markdown) return null;

  const theme =
    sessionStorage.getItem("pendingMigrationTheme") ?? "default";

  const deckId = await createDeck({
    title: "Untitled Deck",
    markdown,
    theme,
    ownerId: user.uid,
    visibility: "unlisted",
  });

  sessionStorage.removeItem("pendingMigrationMarkdown");
  sessionStorage.removeItem("pendingMigrationTheme");

  return deckId;
}
