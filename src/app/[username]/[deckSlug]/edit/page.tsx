import { AuthEditorLayout } from "@/components/editor/EditorLayout";
import { getUserByUsername, getDeckBySlug } from "@/modules/deck-repository";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ username: string; deckSlug: string }>;
}

export const metadata = {
  title: "Editor — mark-deck",
};

export default async function EditDeckPage({ params }: PageProps) {
  const { username, deckSlug } = await params;

  // Resolve deckId from username + slug (server-side, so it's available immediately)
  const user = await getUserByUsername(username);
  if (!user) notFound();

  const deck = await getDeckBySlug(user.id, deckSlug);
  if (!deck) notFound();

  return (
    <AuthEditorLayout
      deckId={deck.id}
      ownerUsername={username}
      deckSlug={deckSlug}
    />
  );
}
