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

interface Props {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  size?: number;
}

export default function UserAvatar({
  userId,
  displayName,
  avatarUrl,
  size = 36,
}: Props) {
  const color = AVATAR_COLORS[userId.charCodeAt(0) % AVATAR_COLORS.length];
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          display: "block",
        }}
      />
    );
  }

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
