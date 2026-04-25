import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Adds an email to the waitlist.
 * Uses the email as the document ID. Firestore security rules only allow `create`
 * (not `update`) on waitlist docs, so writing to an existing doc throws permission-denied,
 * which we treat as a duplicate.
 */
export async function joinWaitlist(
  email: string,
  userId: string | null
): Promise<"ok" | "duplicate"> {
  const docId = email.toLowerCase().trim().replace(/[/.#$[\]]/g, "_");

  try {
    await setDoc(doc(db, "waitlist", docId), {
      email: email.toLowerCase().trim(),
      userId,
      createdAt: serverTimestamp(),
    });
    return "ok";
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "permission-denied") return "duplicate";
    throw err;
  }
}
