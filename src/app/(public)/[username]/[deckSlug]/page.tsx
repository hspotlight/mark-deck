import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { getUserByUsername, getDeckBySlug } from "@/modules/deck-repository";
import UserAvatar from "@/components/UserAvatar";
import DeckActions from "./DeckActions";

interface PageProps {
  params: Promise<{ username: string; deckSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, deckSlug } = await params;
  const user = await getUserByUsername(username);
  if (!user) return { title: "Not found — mark-deck" };
  const deck = await getDeckBySlug(user.id, deckSlug);
  if (!deck || deck.visibility === "private") return { title: "Not found — mark-deck" };

  return {
    title: `${deck.title} — ${user.displayName}`,
    description: deck.description ?? `A deck by ${user.displayName} on mark-deck.`,
    robots: deck.visibility === "unlisted" ? "noindex" : "index,follow",
    openGraph: {
      title: `${deck.title} — ${user.displayName}`,
      description: deck.description ?? `A deck by ${user.displayName} on mark-deck.`,
      images: [{ url: deck.thumbnailUrl ?? "/og-image.png" }],
      type: "website",
    },
  };
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function DeckViewerPage({ params }: PageProps) {
  const { username, deckSlug } = await params;

  const user = await getUserByUsername(username);
  if (!user) notFound();

  const deck = await getDeckBySlug(user.id, deckSlug);
  if (!deck || deck.visibility === "private") notFound();

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const currentUrl = `${protocol}://${host}/${username}/${deckSlug}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="w-full aspect-video bg-white rounded-xl overflow-hidden border border-slate-200 shadow-lg mb-8">
          {deck.htmlUrl ? (
            <iframe
              src={deck.htmlUrl}
              sandbox="allow-scripts"
              className="w-full h-full border-0"
              title={deck.title}
              data-testid="deck-iframe"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              This deck hasn&apos;t been published yet.
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex-1">
            <h1
              className="text-2xl font-bold text-slate-900 mb-3"
              data-testid="deck-title"
            >
              {deck.title}
            </h1>

            <Link
              href={`/${username}`}
              className="inline-flex items-center gap-3 mb-4 no-underline group"
            >
              <UserAvatar
                userId={user.id}
                displayName={user.displayName}
                avatarUrl={user.avatarUrl}
                size={32}
              />
              <span className="text-sm font-medium text-slate-700 group-hover:text-[#6366F1] transition-colors">
                {user.displayName}
              </span>
            </Link>

            {deck.publishedAt && (
              <p className="text-sm text-slate-400 mb-2">
                {formatDate(deck.publishedAt)}
              </p>
            )}

            {deck.description && (
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                {deck.description}
              </p>
            )}

            <p className="text-xs text-slate-400" data-testid="deck-stats">
              {deck.viewCount} {deck.viewCount === 1 ? "view" : "views"} ·{" "}
              {deck.downloadCount}{" "}
              {deck.downloadCount === 1 ? "download" : "downloads"}
            </p>

            <DeckActions
              deckId={deck.id}
              pdfUrl={deck.pdfUrl}
              currentUrl={currentUrl}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
