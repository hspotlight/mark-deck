/**
 * Unit tests for Group B – Issue #08: Authentication
 *
 * Tests auth-module business logic (ensureUserDocument) and
 * AuthContext signUpWithEmail client-side validation.
 *
 * Run: npm test -- --testPathPattern=auth.test
 */

import type { User as FirebaseUser } from "firebase/auth";

// ---------------------------------------------------------------------------
// Mocks — declared before imports so jest.mock factories can reference them
// ---------------------------------------------------------------------------

jest.mock("@/lib/firebase", () => ({
  auth: {},
  db: "mock-db",
  storage: {},
  functions: {},
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn().mockReturnValue("mock-doc-ref"),
  getDoc: jest.fn(),
  setDoc: jest.fn().mockResolvedValue(undefined),
  serverTimestamp: jest.fn().mockReturnValue("MOCK_SERVER_TIMESTAMP"),
  collection: jest.fn(),
  addDoc: jest.fn(),
}));

jest.mock("@/modules/deck-repository", () => ({
  createDeck: jest.fn().mockResolvedValue("mock-deck-id"),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

const mockCreateUserWithEmailAndPassword = jest.fn();
const mockOnAuthStateChanged = jest.fn() as jest.Mock;

jest.mock("firebase/auth", () => ({
  GoogleAuthProvider: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (...args: any[]) => mockCreateUserWithEmailAndPassword(...args)
  ),
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAuthStateChanged: jest.fn((...args: any[]) => mockOnAuthStateChanged(...args)),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import * as firestoreMocks from "firebase/firestore";
import { ensureUserDocument } from "@/modules/auth-module";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeUser(overrides: Partial<FirebaseUser> = {}): FirebaseUser {
  return {
    uid: "user-123",
    displayName: "Test User",
    email: "test@example.com",
    photoURL: "https://example.com/avatar.jpg",
    ...overrides,
  } as FirebaseUser;
}

const mockedGetDoc = firestoreMocks.getDoc as jest.Mock;
const mockedSetDoc = firestoreMocks.setDoc as jest.Mock;

// ---------------------------------------------------------------------------
// Tests: ensureUserDocument
// ---------------------------------------------------------------------------

describe("ensureUserDocument", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset setDoc to resolve successfully
    mockedSetDoc.mockResolvedValue(undefined);
  });

  it("creates user document with correct fields on first sign-in", async () => {
    mockedGetDoc.mockResolvedValue({ exists: () => false });

    const user = makeUser();
    await ensureUserDocument(user);

    expect(mockedSetDoc).toHaveBeenCalledTimes(1);
    const [, data] = mockedSetDoc.mock.calls[0];
    expect(data).toMatchObject({
      displayName: "Test User",
      email: "test@example.com",
      avatarUrl: "https://example.com/avatar.jpg",
      bio: "",
      storageUsedBytes: 0,
      username: null,
      createdAt: "MOCK_SERVER_TIMESTAMP",
    });
  });

  it("does not overwrite username field on subsequent sign-ins", async () => {
    mockedGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        username: "existinghandle",
        displayName: "Old Name",
        email: "test@example.com",
      }),
    });

    const user = makeUser({ displayName: "Updated Name" });
    await ensureUserDocument(user);

    expect(mockedSetDoc).toHaveBeenCalledTimes(1);
    const [, data, options] = mockedSetDoc.mock.calls[0];
    expect(options).toEqual({ merge: true });
    expect(data).not.toHaveProperty("username");
    expect(data).toMatchObject({
      displayName: "Updated Name",
      avatarUrl: "https://example.com/avatar.jpg",
    });
  });

  it("derives displayName from email prefix when displayName is null", async () => {
    mockedGetDoc.mockResolvedValue({ exists: () => false });

    const user = makeUser({ displayName: null, email: "janedoe@example.com" });
    await ensureUserDocument(user);

    const [, data] = mockedSetDoc.mock.calls[0];
    expect(data.displayName).toBe("janedoe");
  });
});

// ---------------------------------------------------------------------------
// Tests: signUpWithEmail validation (via AuthContext)
// ---------------------------------------------------------------------------

describe("signUpWithEmail (AuthContext)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChanged.mockImplementation(
      (_auth: unknown, cb: (user: null) => void) => {
        cb(null);
        return () => {};
      }
    );
  });

  it("never calls Firebase when passwords do not match", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      ),
    });

    await act(async () => {
      try {
        await result.current.signUpWithEmail(
          "user@example.com",
          "password123",
          "different456"
        );
      } catch {
        // Expected
      }
    });

    expect(mockCreateUserWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it("throws with code auth/passwords-do-not-match for mismatched passwords", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      ),
    });

    let caughtCode: string | undefined;
    await act(async () => {
      try {
        await result.current.signUpWithEmail(
          "user@example.com",
          "password123",
          "different456"
        );
      } catch (err) {
        caughtCode = (err as { code?: string }).code;
      }
    });

    expect(caughtCode).toBe("auth/passwords-do-not-match");
  });

  it("calls Firebase when passwords match", async () => {
    mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: makeUser() });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      ),
    });

    await act(async () => {
      await result.current.signUpWithEmail(
        "user@example.com",
        "password123",
        "password123"
      );
    });

    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
  });
});
