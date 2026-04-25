import { AnonEditorLayout, AuthEditorLayout } from "@/components/editor/EditorLayout";

interface PageProps {
  searchParams: Promise<{ deckId?: string }>;
}

export const metadata = {
  title: "Editor — mark-deck",
  description: "Write and preview Marp slides in your browser.",
};

export default async function EditorPage({ searchParams }: PageProps) {
  const { deckId } = await searchParams;

  if (deckId) {
    return <AuthEditorLayout deckId={deckId} />;
  }

  return <AnonEditorLayout />;
}
