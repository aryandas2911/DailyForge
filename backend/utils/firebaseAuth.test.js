import assert from "node:assert/strict";
import test from "node:test";

import { verifyFirebaseIdToken } from "./firebaseAuth.js";

function base64UrlEncode(obj) {
  return Buffer.from(JSON.stringify(obj))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function makeFakeJwt(payload) {
  const header = { alg: "RS256", typ: "JWT", kid: "test" };
  return `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.signature`;
}

function withEnv(overrides, fn) {
  const prev = { ...process.env };
  Object.entries(overrides).forEach(([k, v]) => {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  });
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      process.env = prev;
    });
}

test("verifyFirebaseIdToken fails closed when FIREBASE_PROJECT_ID is missing", async () => {
  const token = makeFakeJwt({ exp: Math.floor(Date.now() / 1000) + 3600, email: "a@b.com" });

  await withEnv(
    {
      FIREBASE_PROJECT_ID: undefined,
      FIREBASE_AUTH_ALLOW_UNVERIFIED: undefined,
      NODE_ENV: "test",
    },
    async () => {
      await assert.rejects(
        () => verifyFirebaseIdToken(token),
        /FIREBASE_PROJECT_ID is not configured/
      );
    }
  );
});

test("verifyFirebaseIdToken allows unverified decode only with explicit dev opt-in", async () => {
  const token = makeFakeJwt({
    exp: Math.floor(Date.now() / 1000) + 3600,
    email: "dev@example.com",
    name: "Dev User",
  });

  await withEnv(
    {
      FIREBASE_PROJECT_ID: undefined,
      FIREBASE_AUTH_ALLOW_UNVERIFIED: "true",
      NODE_ENV: "development",
    },
    async () => {
      const decoded = await verifyFirebaseIdToken(token);
      assert.equal(decoded.email, "dev@example.com");
      assert.equal(decoded.name, "Dev User");
    }
  );
});

test("verifyFirebaseIdToken never allows unverified decode in production", async () => {
  const token = makeFakeJwt({ exp: Math.floor(Date.now() / 1000) + 3600, email: "a@b.com" });

  await withEnv(
    {
      FIREBASE_PROJECT_ID: undefined,
      FIREBASE_AUTH_ALLOW_UNVERIFIED: "true",
      NODE_ENV: "production",
    },
    async () => {
      await assert.rejects(
        () => verifyFirebaseIdToken(token),
        /FIREBASE_PROJECT_ID is not configured/
      );
    }
  );
});

