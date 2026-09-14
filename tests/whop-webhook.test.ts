import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyWhopWebhook } from "@/lib/whop";

// Simulates Whop's Standard Webhooks signing.
function sign(body: string, id: string, ts: string, key: Buffer) {
  const digest = createHmac("sha256", key).update(`${id}.${ts}.${body}`).digest("base64");
  return `v1,${digest}`;
}

const SECRET = "ws_3f6a7b2c9d1e4f5a8b7c6d5e4f3a2b1c";
process.env.WHOP_WEBHOOK_SECRET = SECRET;
const ID = "msg_1234567890";
const TS = String(Math.floor(Date.now() / 1000));
const BODY = JSON.stringify({ type: "membership.activated", data: { id: "x" } });

function makeHeaders(signature: string) {
  const h = new Headers();
  h.set("webhook-id", ID);
  h.set("webhook-timestamp", TS);
  h.set("webhook-signature", signature);
  return h;
}

describe("verifyWhopWebhook (Standard Webhooks)", () => {
  it("accepts HMAC over raw secret bytes incl ws_ prefix", () => {
    const rawKey = Buffer.from(SECRET, "utf8");
    const sig = sign(BODY, ID, TS, rawKey);
    expect(verifyWhopWebhook(BODY, makeHeaders(sig))).toBe(true);
  });

  it("accepts the spec encoding: base64-decoded key after ws_", () => {
    const specKey = Buffer.from(SECRET.slice("ws_".length), "base64");
    const sig = sign(BODY, ID, TS, specKey);
    expect(verifyWhopWebhook(BODY, makeHeaders(sig))).toBe(true);
  });

  it("accepts space-delimited rotated signatures when one matches", () => {
    const oldKey = Buffer.from("rotated-old-secret", "utf8");
    const currentKey = Buffer.from(SECRET, "utf8");
    const oldSig = sign(BODY, ID, TS, oldKey);
    const currentSig = sign(BODY, ID, TS, currentKey);
    const header = `${oldSig} ${currentSig}`;
    expect(verifyWhopWebhook(BODY, makeHeaders(header))).toBe(true);
  });

  it("rejects a tampered body", () => {
    const rawKey = Buffer.from(SECRET, "utf8");
    const sig = sign(BODY, ID, TS, rawKey);
    const tampered = BODY.replace('"id":"x"', '"id":"y"');
    expect(verifyWhopWebhook(tampered, makeHeaders(sig))).toBe(false);
  });

  it("rejects wrong secrets", () => {
    const sig = sign(BODY, ID, TS, Buffer.from("wrong-secret", "utf8"));
    expect(verifyWhopWebhook(BODY, makeHeaders(sig))).toBe(false);
  });

  it("rejects stale timestamps (replay protection)", () => {
    const rawKey = Buffer.from(SECRET, "utf8");
    const staleTs = String(Math.floor(Date.now() / 1000) - 60 * 60);
    const sig = sign(BODY, ID, staleTs, rawKey);
    expect(verifyWhopWebhook(BODY, makeHeaders(sig))).toBe(false);
  });

  it("rejects bare base64 without the v1 envelope", () => {
    const rawKey = Buffer.from(SECRET, "utf8");
    const digest = createHmac("sha256", rawKey).update(`${ID}.${TS}.${BODY}`).digest("base64");
    expect(verifyWhopWebhook(BODY, makeHeaders(digest))).toBe(false);
  });

  it("rejects missing headers", () => {
    const rawKey = Buffer.from(SECRET, "utf8");
    const sig = sign(BODY, ID, TS, rawKey);
    const h = makeHeaders(sig);
    h.delete("webhook-id");
    expect(verifyWhopWebhook(BODY, h)).toBe(false);
  });

  it("returns false when no secret is configured", () => {
    const old = process.env.WHOP_WEBHOOK_SECRET;
    delete process.env.WHOP_WEBHOOK_SECRET;
    try {
      const rawKey = Buffer.from(SECRET, "utf8");
      const sig = sign(BODY, ID, TS, rawKey);
      expect(verifyWhopWebhook(BODY, makeHeaders(sig))).toBe(false);
    } finally {
      if (old) process.env.WHOP_WEBHOOK_SECRET = old;
    }
  });
});
