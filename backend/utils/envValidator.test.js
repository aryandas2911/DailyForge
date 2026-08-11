import assert from "node:assert/strict";
import test from "node:test";
import { validateEnv } from "./envValidator.js";

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

test("validateEnv succeeds when all required env vars are valid", async () => {
  const validHexKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  await withEnv(
    {
      PORT: "5000",
      MONGO_URI: "mongodb://localhost:27017/test",
      JWT_SECRET: "super_secret_jwt_key_that_is_at_least_32_chars_long",
      FRONTEND_URL: "http://localhost:5173",
      TWO_FACTOR_ENCRYPTION_KEY: validHexKey,
    },
    async () => {
      validateEnv();
      assert.ok(true);
    }
  );
});
