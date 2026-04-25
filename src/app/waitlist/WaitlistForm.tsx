"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import { joinWaitlist } from "@/modules/waitlist";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "duplicate">("idle");
  const [errorOpen, setErrorOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) return;

    setLoading(true);
    try {
      const result = await joinWaitlist(trimmed, null);
      setStatus(result === "ok" ? "success" : "duplicate");
    } catch {
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  }

  if (status === "success") {
    return (
      <p className="text-slate-700 font-medium" data-testid="waitlist-success">
        You&apos;re on the list! We&apos;ll email you when Pro launches.
      </p>
    );
  }

  if (status === "duplicate") {
    return (
      <p className="text-slate-500" data-testid="waitlist-duplicate">
        You&apos;re already on the list.
      </p>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3" noValidate>
        <TextField
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          size="small"
          slotProps={{ htmlInput: { "data-testid": "email-input" } }}
          sx={{ flexGrow: 1, maxWidth: 360 }}
          disabled={loading}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          data-testid="waitlist-submit"
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : null}
        >
          {loading ? "Joining…" : "Join the waitlist"}
        </Button>
      </form>

      <Snackbar
        open={errorOpen}
        autoHideDuration={4000}
        onClose={() => setErrorOpen(false)}
        message="Something went wrong. Please try again."
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}
