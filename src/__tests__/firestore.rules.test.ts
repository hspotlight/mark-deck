/**
 * Firestore security rules unit tests.
 * Requires Firebase Emulator running: npm run emulators
 *
 * Run standalone: FIREBASE_EMULATOR=true npx jest firestore.rules
 */

import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  setDoc,
  getDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-mark-deck",
    firestore: {
      rules: readFileSync(resolve(__dirname, "../../firestore.rules"), "utf8"),
      host: "localhost",
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

describe("decks collection", () => {
  it("allows reading a public deck anonymously", async () => {
    const owner = testEnv.authenticatedContext("user-1");
    await owner.firestore().collection("decks").doc("deck-1").set({
      title: "Public Deck",
      visibility: "public",
      ownerId: "user-1",
    });

    const anon = testEnv.unauthenticatedContext();
    await assertSucceeds(
      getDoc(doc(anon.firestore(), "decks", "deck-1"))
    );
  });

  it("denies reading a private deck anonymously", async () => {
    const owner = testEnv.authenticatedContext("user-1");
    await owner.firestore().collection("decks").doc("deck-2").set({
      title: "Private Deck",
      visibility: "private",
      ownerId: "user-1",
    });

    const anon = testEnv.unauthenticatedContext();
    await assertFails(
      getDoc(doc(anon.firestore(), "decks", "deck-2"))
    );
  });

  it("allows owner to read their own private deck", async () => {
    const owner = testEnv.authenticatedContext("user-1");
    await owner.firestore().collection("decks").doc("deck-3").set({
      title: "Private Deck",
      visibility: "private",
      ownerId: "user-1",
    });

    await assertSucceeds(
      getDoc(doc(owner.firestore(), "decks", "deck-3"))
    );
  });

  it("denies non-owner from writing a deck", async () => {
    const owner = testEnv.authenticatedContext("user-1");
    await owner.firestore().collection("decks").doc("deck-4").set({
      title: "Public Deck",
      visibility: "public",
      ownerId: "user-1",
    });

    const other = testEnv.authenticatedContext("user-2");
    await assertFails(
      setDoc(doc(other.firestore(), "decks", "deck-4"), {
        title: "Hacked",
        visibility: "public",
        ownerId: "user-2",
      })
    );
  });
});

describe("users collection", () => {
  it("allows anyone to read a user profile", async () => {
    const user = testEnv.authenticatedContext("user-1");
    await user.firestore().collection("users").doc("user-1").set({
      username: "testuser",
    });

    const anon = testEnv.unauthenticatedContext();
    await assertSucceeds(
      getDoc(doc(anon.firestore(), "users", "user-1"))
    );
  });

  it("allows user to write their own profile", async () => {
    const user = testEnv.authenticatedContext("user-1");
    await assertSucceeds(
      setDoc(doc(user.firestore(), "users", "user-1"), { username: "testuser" })
    );
  });

  it("denies user from writing another user's profile", async () => {
    const user = testEnv.authenticatedContext("user-2");
    await assertFails(
      setDoc(doc(user.firestore(), "users", "user-1"), { username: "hacked" })
    );
  });
});

describe("waitlist collection", () => {
  it("allows anyone to create a waitlist entry", async () => {
    const anon = testEnv.unauthenticatedContext();
    await assertSucceeds(
      setDoc(doc(anon.firestore(), "waitlist", "entry-1"), {
        email: "user@example.com",
      })
    );
  });

  it("denies reading waitlist entries", async () => {
    const anon = testEnv.unauthenticatedContext();
    await assertFails(
      getDoc(doc(anon.firestore(), "waitlist", "entry-1"))
    );
  });
});
