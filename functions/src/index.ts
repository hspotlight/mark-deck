import * as functions from "firebase-functions";

// Placeholder HTTP function to verify Functions setup.
// This will be replaced in issue #14.
export const helloWorld = functions.https.onRequest((_req, res) => {
  res.json({ message: "Hello from mark-deck Cloud Functions!" });
});
