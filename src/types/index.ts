export interface Deck {
  id: string;
  title: string;
  description?: string;
  markdown?: string;
  slug: string;
  ownerId: string;
  visibility: "public" | "unlisted" | "private";
  htmlUrl?: string | null;
  pdfUrl?: string | null;
  thumbnailUrl?: string | null;
  publishedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  viewCount: number;
  downloadCount: number;
  theme?: string;
}

export interface UserProfile {
  id: string;
  username?: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string | null;
  email?: string;
}
