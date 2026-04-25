import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { getUserByUsername, getDeckBySlug } from "@/modules/deck-repository";
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
      {/* Nav */}
      <nav className="px-6 md:px-12 py-4 border-b border-slate-100 bg-white">
        <Link href="/" className="text-sm font-bold font-mono text-slate-900 no-underline">
          mark-deck
        </Link>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Slide iframe */}
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

        {/* Metadata + actions */}
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 mb-3" data-testid="deck-title">
              {deck.title}
            </h1>

            {/* Author */}
            <Link
              href={`/${username}`}
              className="inline-flex items-center gap-3 mb-4 no-underline group"
            >
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <InitialsAvatar userId={user.id} displayName={user.displayName} size={32} />
              )}
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
              {deck.downloadCount} {deck.downloadCount === 1 ? "download" : "downloads"}
            </p>

            <DeckActions deckId={deck.id} pdfUrl={deck.pdfUrl} currentUrl={currentUrl} />
          </div>
        </div>
      </main>
    </div>
  );
}

const AVATAR_COLORS = [
  "#6366F1",
  "#8B5CF6",
  "#3B82F6",
  "#0EA5E9",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
];

function InitialsAvatar({
  userId,
  displayName,
  size,
}: {
  userId: string;
  displayName: string;
  size: number;
}) {
  const color = AVATAR_COLORS[userId.charCodeAt(0) % AVATAR_COLORS.length];
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: color,
        color: "#fff",
        fontSize: size * 0.4,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  );
}
