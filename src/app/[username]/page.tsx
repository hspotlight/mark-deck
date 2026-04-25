import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getUserByUsername, getPublicDecksByUser } from "@/modules/deck-repository";
import type { Deck } from "@/types";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) return { title: "Not found — mark-deck" };

  return {
    title: `${user.displayName} (@${username}) — mark-deck`,
    description: user.bio ?? `View ${user.displayName}'s public decks on mark-deck.`,
    openGraph: {
      title: `${user.displayName} (@${username}) — mark-deck`,
      description: user.bio ?? `View ${user.displayName}'s public decks on mark-deck.`,
      images: user.avatarUrl ? [{ url: user.avatarUrl }] : [{ url: "/og-image.png" }],
    },
  };
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const AVATAR_COLORS = [
  "#6366F1", "#8B5CF6", "#3B82F6", "#0EA5E9",
  "#10B981", "#F59E0B", "#EF4444", "#EC4899",
];

function InitialsAvatar({ userId, displayName }: { userId: string; displayName: string }) {
  const color = AVATAR_COLORS[userId.charCodeAt(0) % AVATAR_COLORS.length];
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span
      style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        backgroundColor: color,
        color: "#fff",
        fontSize: 18,
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

function DeckCard({ deck, username }: { deck: Deck; username: string }) {
  return (
    <Link
      href={`/${username}/${deck.slug}`}
      className="group block bg-white rounded-xl border border-slate-100 overflow-hidden hover:border-indigo-200 hover:shadow-md transition-all no-underline"
      data-testid="deck-card"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-slate-50 flex items-center justify-center overflow-hidden">
        {deck.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={deck.thumbnailUrl}
            alt={deck.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center p-4 text-center"
            style={{ backgroundColor: "#EEF2FF" }}
          >
            <span className="text-sm font-semibold text-indigo-400 leading-snug line-clamp-3">
              {deck.title}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-1 group-hover:text-[#6366F1] transition-colors line-clamp-2">
          {deck.title}
        </h3>
        {deck.publishedAt && (
          <p className="text-xs text-slate-400">{formatDate(deck.publishedAt)}</p>
        )}
      </div>
    </Link>
  );
}

export default async function AuthorProfilePage({ params }: PageProps) {
  const { username } = await params;

  const user = await getUserByUsername(username);
  if (!user) notFound();

  const decks = await getPublicDecksByUser(user.id);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* Nav */}
      <nav className="px-6 md:px-12 py-4 border-b border-slate-100 bg-white">
        <Link href="/" className="text-sm font-bold font-mono text-slate-900 no-underline">
          mark-deck
        </Link>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Profile header */}
        <div className="flex items-start gap-4 mb-10">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="w-12 h-12 rounded-full object-cover shrink-0"
            />
          ) : (
            <InitialsAvatar userId={user.id} displayName={user.displayName} />
          )}

          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight" data-testid="profile-name">
              {user.displayName}
            </h1>
            <p className="text-sm text-[#475569] mb-1">@{username}</p>
            {user.bio && (
              <p className="text-sm text-slate-500 truncate max-w-lg" data-testid="profile-bio">
                {user.bio}
              </p>
            )}
          </div>
        </div>

        {/* Deck grid */}
        {decks.length === 0 ? (
          <p className="text-slate-400 text-sm" data-testid="empty-state">
            No public decks yet
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {decks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} username={username} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
