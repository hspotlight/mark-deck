import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  increment,
  limit,
  orderBy,
  serverTimestamp,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/db";
import type { Deck, UserProfile } from "@/types";

export const FREE_TIER_LIMIT = "FREE_TIER_LIMIT";
export const SLUG_LOCKED = "SLUG_LOCKED";

function toDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === "object" && "toDate" in (val as object)) {
    return (val as { toDate: () => Date }).toDate();
  }
  return null;
}

function toDeck(id: string, data: Record<string, unknown>): Deck {
  return {
    id,
    title: (data.title as string) ?? "",
    description: (data.description as string | undefined) ?? undefined,
    markdown: (data.markdown as string | undefined) ?? "",
    slug: (data.slug as string) ?? "",
    ownerId: (data.ownerId as string) ?? "",
    theme: (data.theme as string | undefined) ?? "default",
    visibility:
      (data.visibility as "public" | "unlisted" | "private") ?? "unlisted",
    htmlUrl: (data.htmlUrl as string | null) ?? null,
    pdfUrl: (data.pdfUrl as string | null) ?? null,
    thumbnailUrl: (data.thumbnailUrl as string | null) ?? null,
    publishedAt: toDate(data.publishedAt),
    createdAt: toDate(data.createdAt) ?? undefined,
    updatedAt: toDate(data.updatedAt) ?? undefined,
    viewCount: (data.viewCount as number) ?? 0,
    downloadCount: (data.downloadCount as number) ?? 0,
  };
}

export async function getUserByUsername(
  username: string
): Promise<UserProfile | null> {
  const q = query(
    collection(db, "users"),
    where("username", "==", username),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as Omit<UserProfile, "id">) };
}

export async function getPublicDecksByUser(userId: string): Promise<Deck[]> {
  const q = query(
    collection(db, "decks"),
    where("ownerId", "==", userId),
    where("visibility", "==", "public"),
    orderBy("publishedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) =>
    toDeck(d.id, d.data() as Record<string, unknown>)
  );
}

export async function getDeckBySlug(
  userId: string,
  deckSlug: string
): Promise<Deck | null> {
  const q = query(
    collection(db, "decks"),
    where("ownerId", "==", userId),
    where("slug", "==", deckSlug),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return toDeck(snap.docs[0].id, snap.docs[0].data() as Record<string, unknown>);
}

export async function getDeck(deckId: string): Promise<Deck | null> {
  const snap = await getDoc(doc(db, "decks", deckId));
  if (!snap.exists()) return null;
  return toDeck(snap.id, snap.data() as Record<string, unknown>);
}

export function listDecks(
  ownerId: string,
  onUpdate: (decks: Deck[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "decks"),
    where("ownerId", "==", ownerId),
    orderBy("updatedAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    onUpdate(
      snap.docs.map((d) => toDeck(d.id, d.data() as Record<string, unknown>))
    );
  });
}

export interface UpdateDeckData {
  title?: string;
  description?: string;
  markdown?: string;
  theme?: string;
  visibility?: "public" | "unlisted" | "private";
  slug?: string;
}

export async function updateDeck(
  deckId: string,
  data: UpdateDeckData
): Promise<void> {
  if (data.slug !== undefined) {
    const snap = await getDoc(doc(db, "decks", deckId));
    if (snap.exists() && snap.data().publishedAt !== null) {
      const err = new Error("Cannot change slug of a published deck") as Error & {
        code: string;
      };
      err.code = SLUG_LOCKED;
      throw err;
    }
  }
  await updateDoc(doc(db, "decks", deckId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDeck(deckId: string): Promise<void> {
  await deleteDoc(doc(db, "decks", deckId));
}

export async function incrementViewCount(deckId: string): Promise<void> {
  await updateDoc(doc(db, "decks", deckId), { viewCount: increment(1) });
}

export async function incrementDownloadCount(deckId: string): Promise<void> {
  await updateDoc(doc(db, "decks", deckId), { downloadCount: increment(1) });
}

export interface CreateDeckInput {
  title: string;
  markdown: string;
  theme: string;
  ownerId: string;
  visibility: "public" | "unlisted" | "private";
  slug?: string;
}

export async function createDeck(input: CreateDeckInput): Promise<string> {
  const q = query(
    collection(db, "decks"),
    where("ownerId", "==", input.ownerId)
  );
  const snap = await getDocs(q);
  if (snap.size >= 1) {
    const err = new Error("Free tier limit reached") as Error & { code: string };
    err.code = FREE_TIER_LIMIT;
    throw err;
  }

  const ref = await addDoc(collection(db, "decks"), {
    title: input.title,
    description: null,
    markdown: input.markdown,
    theme: input.theme,
    ownerId: input.ownerId,
    visibility: input.visibility,
    slug: input.slug ?? "",
    viewCount: 0,
    downloadCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: null,
    htmlUrl: null,
    pdfUrl: null,
    thumbnailUrl: null,
  });
  return ref.id;
}
