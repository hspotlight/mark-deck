import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  increment,
  limit,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/db";
import type { Deck, UserProfile } from "@/types";

function toDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  // Firestore Timestamp
  if (typeof val === "object" && "toDate" in (val as object)) {
    return (val as { toDate: () => Date }).toDate();
  }
  return null;
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
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title ?? "",
      description: data.description,
      slug: data.slug ?? "",
      ownerId: data.ownerId ?? "",
      visibility: data.visibility ?? "private",
      htmlUrl: data.htmlUrl ?? null,
      pdfUrl: data.pdfUrl ?? null,
      thumbnailUrl: data.thumbnailUrl ?? null,
      publishedAt: toDate(data.publishedAt),
      viewCount: data.viewCount ?? 0,
      downloadCount: data.downloadCount ?? 0,
    } satisfies Deck;
  });
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
  const d = snap.docs[0];
  const data = d.data();
  return {
    id: d.id,
    title: data.title ?? "",
    description: data.description,
    slug: data.slug ?? "",
    ownerId: data.ownerId ?? "",
    visibility: data.visibility ?? "private",
    htmlUrl: data.htmlUrl ?? null,
    pdfUrl: data.pdfUrl ?? null,
    thumbnailUrl: data.thumbnailUrl ?? null,
    publishedAt: toDate(data.publishedAt),
    viewCount: data.viewCount ?? 0,
    downloadCount: data.downloadCount ?? 0,
  } satisfies Deck;
}

export async function incrementViewCount(deckId: string): Promise<void> {
  await updateDoc(doc(db, "decks", deckId), { viewCount: increment(1) });
}

export async function incrementDownloadCount(deckId: string): Promise<void> {
  await updateDoc(doc(db, "decks", deckId), { downloadCount: increment(1) });
}
