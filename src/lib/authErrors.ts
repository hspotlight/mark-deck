export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/wrong-password": "Incorrect password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/user-not-found": "No account found with this email.",
  "auth/weak-password": "Password is too weak (minimum 6 characters).",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/popup-closed-by-user": "Sign-in popup was closed.",
  "auth/cancelled-popup-request": "Sign-in was cancelled.",
  "auth/network-request-failed":
    "Network error. Check your connection and try again.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/requires-recent-login": "Please sign in again to continue.",
  "auth/passwords-do-not-match": "Passwords do not match.",
};

export function getAuthErrorMessage(code: string): string {
  return (
    AUTH_ERROR_MESSAGES[code] ??
    "An unexpected error occurred. Please try again."
  );
}
