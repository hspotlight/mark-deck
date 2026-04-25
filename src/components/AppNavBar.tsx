"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { useAuth } from "@/contexts/AuthContext";
import UserAvatar from "./UserAvatar";

export default function AppNavBar() {
  const { user, userProfile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  if (!user) return null;

  const isDashboard = pathname === "/dashboard";
  const username = userProfile?.username ?? null;

  function handleAvatarClick(e: React.MouseEvent<HTMLElement>) {
    setAnchorEl(e.currentTarget);
  }

  function handleMenuClose() {
    setAnchorEl(null);
  }

  async function handleSignOut() {
    handleMenuClose();
    await signOut();
  }

  return (
    <header
      className="flex items-center justify-between px-4 md:px-6 border-b border-neutral-200 bg-white shrink-0"
      style={{ height: 56 }}
    >
      {/* Left: Logo */}
      <Link
        href="/dashboard"
        className="text-sm font-bold font-mono text-slate-900 no-underline"
      >
        mark-deck
      </Link>

      {/* Center: Dashboard link (hidden on small screens) */}
      <nav className="hidden md:flex items-center">
        <Link
          href="/dashboard"
          className={`text-sm font-medium px-3 no-underline transition-colors ${
            isDashboard
              ? "text-[#6366F1] border-b-2 border-[#6366F1] pb-px"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Dashboard
        </Link>
      </nav>

      {/* Right: + New Deck + Avatar */}
      <div className="flex items-center gap-3">
        <Button
          variant="contained"
          size="small"
          disableElevation
          onClick={() => router.push("/dashboard?new=1")}
          sx={{
            textTransform: "none",
            fontSize: 13,
            height: 32,
            bgcolor: "#6366F1",
            "&:hover": { bgcolor: "#4F46E5" },
          }}
          data-testid="new-deck-btn"
        >
          + New Deck
        </Button>

        <button
          onClick={handleAvatarClick}
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-1"
          aria-label="Account menu"
          data-testid="avatar-btn"
        >
          <UserAvatar
            userId={user.uid}
            displayName={user.displayName ?? user.email ?? "User"}
            avatarUrl={user.photoURL}
            size={36}
          />
        </button>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{ paper: { sx: { mt: 0.5, minWidth: 160 } } }}
        >
          {username ? (
            <MenuItem
              component={Link}
              href={`/${username}`}
              onClick={handleMenuClose}
              sx={{ fontSize: 14 }}
              data-testid="menu-profile"
            >
              My Profile
            </MenuItem>
          ) : (
            <MenuItem disabled sx={{ fontSize: 14 }} data-testid="menu-profile-unset">
              Profile (not set yet)
            </MenuItem>
          )}
          <MenuItem
            component={Link}
            href="/settings"
            onClick={handleMenuClose}
            sx={{ fontSize: 14 }}
          >
            Settings
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={handleSignOut}
            sx={{ fontSize: 14 }}
            data-testid="menu-signout"
          >
            Sign out
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
}
