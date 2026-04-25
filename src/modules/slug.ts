import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/^-|-$/g, "");
}

export async function ensureUniqueSlug(
  ownerId: string,
  baseSlug: string
): Promise<string> {
  const q = query(
    collection(db, "decks"),
    where("ownerId", "==", ownerId)
  );
  const snap = await getDocs(q);
  const existing = new Set(snap.docs.map((d) => d.data().slug as string));

  if (!existing.has(baseSlug)) return baseSlug;

  let i = 2;
  while (existing.has(`${baseSlug}-${i}`)) i++;
  return `${baseSlug}-${i}`;
}
