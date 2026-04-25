/**
 * Unit tests for Group B – Issue #09: Anonymous → Permanent Account Migration
 *
 * Tests handleMigration from auth-module, which reads sessionStorage and
 * calls DeckRepository.createDeck when pending content exists.
 *
 * Run: npm test -- --testPathPattern=anonymous-migration.test
 */

import { handleMigration } from "@/modules/auth-module";
import type { User as FirebaseUser } from "firebase/auth";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockCreateDeck = jest.fn();

jest.mock("@/modules/deck-repository", () => ({
  createDeck: (...args: unknown[]) => mockCreateDeck(...args),
}));

jest.mock("@/lib/firebase", () => ({
  auth: {},
  db: "mock-db",
  storage: {},
  functions: {},
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(() => "MOCK_SERVER_TIMESTAMP"),
  collection: jest.fn(),
  addDoc: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeUser(overrides: Partial<FirebaseUser> = {}): FirebaseUser {
  return {
    uid: "user-abc",
    displayName: "Migrated User",
    email: "migrated@example.com",
    photoURL: null,
    ...overrides,
  } as FirebaseUser;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("handleMigration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it("calls createDeck with the pending markdown when sessionStorage has content", async () => {
    sessionStorage.setItem("pendingMigrationMarkdown", "# Hello\n\nWorld");
    sessionStorage.setItem("pendingMigrationTheme", "mark-deck-dark");

    mockCreateDeck.mockResolvedValue("new-deck-id");

    const user = makeUser();
    const result = await handleMigration(user);

    expect(mockCreateDeck).toHaveBeenCalledTimes(1);
    expect(mockCreateDeck).toHaveBeenCalledWith({
      title: "Untitled Deck",
      markdown: "# Hello\n\nWorld",
      theme: "mark-deck-dark",
      ownerId: "user-abc",
      visibility: "unlisted",
    });
    expect(result).toBe("new-deck-id");
  });

  it("clears sessionStorage after successful migration", async () => {
    sessionStorage.setItem("pendingMigrationMarkdown", "# Slide");
    sessionStorage.setItem("pendingMigrationTheme", "default");
    mockCreateDeck.mockResolvedValue("deck-xyz");

    await handleMigration(makeUser());

    expect(sessionStorage.getItem("pendingMigrationMarkdown")).toBeNull();
    expect(sessionStorage.getItem("pendingMigrationTheme")).toBeNull();
  });

  it("does NOT call createDeck when sessionStorage has no pending markdown", async () => {
    const result = await handleMigration(makeUser());

    expect(mockCreateDeck).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("defaults theme to 'default' when pendingMigrationTheme is absent", async () => {
    sessionStorage.setItem("pendingMigrationMarkdown", "# Slide");
    // No theme key set
    mockCreateDeck.mockResolvedValue("deck-id");

    await handleMigration(makeUser());

    expect(mockCreateDeck).toHaveBeenCalledWith(
      expect.objectContaining({ theme: "default" })
    );
  });

  it("leaves sessionStorage intact when createDeck throws", async () => {
    sessionStorage.setItem("pendingMigrationMarkdown", "# Content");
    sessionStorage.setItem("pendingMigrationTheme", "gaia");
    mockCreateDeck.mockRejectedValue(new Error("Firestore error"));

    await expect(handleMigration(makeUser())).rejects.toThrow("Firestore error");

    // Content must remain for retry
    expect(sessionStorage.getItem("pendingMigrationMarkdown")).toBe("# Content");
    expect(sessionStorage.getItem("pendingMigrationTheme")).toBe("gaia");
  });
});
