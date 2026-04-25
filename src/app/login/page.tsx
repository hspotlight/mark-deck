"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthErrorMessage } from "@/lib/authErrors";

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      style={{ marginRight: 8, flexShrink: 0 }}
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function getFirebaseCode(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    return String((err as { code: string }).code);
  }
  return "unknown";
}

function LoginForm() {
  const {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
  } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState(0); // 0 = sign in, 1 = sign up
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  if (loading || user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  async function handleGoogleSignIn() {
    setError("");
    setGoogleSubmitting(true);
    try {
      await signInWithGoogle();
      router.replace(redirectTo);
    } catch (err) {
      setError(getAuthErrorMessage(getFirebaseCode(err)));
    } finally {
      setGoogleSubmitting(false);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError(getAuthErrorMessage("auth/invalid-email"));
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      if (tab === 0) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, confirmPassword);
      }
      router.replace(redirectTo);
    } catch (err) {
      setError(getAuthErrorMessage(getFirebaseCode(err)));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    if (!email.includes("@")) {
      setError("Enter your email address above first.");
      return;
    }
    setError("");
    try {
      await sendPasswordReset(email);
      setResetSent(true);
    } catch (err) {
      setError(getAuthErrorMessage(getFirebaseCode(err)));
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        px: 2,
        bgcolor: "#F8FAFC",
      }}
    >
      <Box
        component="main"
        sx={{
          width: "100%",
          maxWidth: 400,
          bgcolor: "white",
          borderRadius: 2,
          border: "1px solid #E2E8F0",
          p: 4,
        }}
      >
        <Link
          href="/"
          className="text-sm font-bold text-slate-900 font-mono no-underline"
        >
          mark-deck
        </Link>

        <Typography
          variant="h6"
          sx={{ fontWeight: 600, mt: 2, mb: 3 }}
        >
          {tab === 0 ? "Welcome back" : "Create your account"}
        </Typography>

        <Tabs
          value={tab}
          onChange={(_, v) => {
            setTab(v);
            setError("");
            setResetSent(false);
          }}
          sx={{ mb: 3, borderBottom: "1px solid #E2E8F0" }}
        >
          <Tab label="Sign In" sx={{ textTransform: "none", fontWeight: 500 }} />
          <Tab label="Sign Up" sx={{ textTransform: "none", fontWeight: 500 }} />
        </Tabs>

        <Button
          fullWidth
          variant="outlined"
          onClick={handleGoogleSignIn}
          disabled={googleSubmitting || submitting}
          sx={{
            textTransform: "none",
            fontWeight: 500,
            borderColor: "#E2E8F0",
            color: "text.primary",
            mb: 2,
            "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" },
          }}
          startIcon={
            googleSubmitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <GoogleIcon />
            )
          }
        >
          Continue with Google
        </Button>

        <Divider sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            or
          </Typography>
        </Divider>

        <Box component="form" onSubmit={handleEmailSubmit} noValidate>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            size="small"
            sx={{ mb: 2 }}
            disabled={submitting || googleSubmitting}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            size="small"
            sx={{ mb: tab === 1 ? 2 : 1 }}
            disabled={submitting || googleSubmitting}
          />

          {tab === 1 && (
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              size="small"
              sx={{ mb: 2 }}
              disabled={submitting || googleSubmitting}
            />
          )}

          {tab === 0 && (
            <Box sx={{ mb: 2 }}>
              {resetSent ? (
                <Typography variant="caption" sx={{ color: "success.main" }}>
                  Password reset email sent. Check your inbox.
                </Typography>
              ) : (
                <Typography
                  variant="caption"
                  sx={{
                    color: "primary.main",
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </Typography>
              )}
            </Box>
          )}

          {error && (
            <Typography
              variant="caption"
              role="alert"
              sx={{ display: "block", color: "error.main", mb: 2 }}
            >
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={submitting || googleSubmitting}
            sx={{ textTransform: "none", fontWeight: 500 }}
            startIcon={
              submitting ? <CircularProgress size={16} color="inherit" /> : null
            }
          >
            {tab === 0 ? "Sign In" : "Create Account"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
          <CircularProgress />
        </Box>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
