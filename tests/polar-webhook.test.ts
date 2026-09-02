import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyPolarWebhook } from "@/lib/polar";

// Simulates Polar's two supported signing modes.
function sign(body: string, id: string, ts: string, secret: string, key: Buffer) {
  const digest = createHmac("sha256", key).update(`${id}.${ts}.${body}`).digest("base64");
  return `v1,${digest}`;
}

const SECRET = "whsec_3f6a7b2c9d1e4f5a8b7c6d5e4f3a2b1c";
process.env.POLAR_WEBHOOK_SECRET = SECRET;
const ID = "msg_1234567890";
const TS = String(Math.floor(Date.now() / 1000));
const BODY = JSON.stringify({ type: "checkout.updated", data: { id: "x" } });

function makeHeaders(signature: string, prefix = "webhook-") {
  const h = new Headers();
  h.set(`${prefix}id`, ID);
  h.set(`${prefix}timestamp`, TS);
  h.set(`${prefix}signature`, signature);
  return h;
}

describe("verifyPolarWebhook (Standard Webhooks)", () => {
  it("accepts Polar's current encoding: HMAC over raw secret bytes incl whsec_", () => {
    const rawKey = Buffer.from(SECRET, "utf8");
    const sig = sign(BODY, ID, TS, SECRET, rawKey);
    expect(verifyPolarWebhook(BODY, makeHeaders(sig))).toBe(true);
  });

  it("accepts the spec encoding: base64-decoded key after whsec_", () => {
    const specKey = Buffer.from(SECRET.slice("whsec_".length), "base64");
    const sig = sign(BODY, ID, TS, SECRET, specKey);
    expect(verifyPolarWebhook(BODY, makeHeaders(sig))).toBe(true);
  });

  it("accepts Polar's legacy polar-webhook-* header names", () => {
    const rawKey = Buffer.from(SECRET, "utf8");
    const sig = sign(BODY, ID, TS, SECRET, rawKey);
    expect(verifyPolarWebhook(BODY, makeHeaders(sig, "polar-webhook-"))).toBe(true);
  });

  it("accepts space-delimited rotated signatures when one matches", () => {
    const oldKey = Buffer.from("rotated-old-secret", "utf8");
    const currentKey = Buffer.from(SECRET, "utf8");
    const oldSig = sign(BODY, ID, TS, SECRET, oldKey);
    const currentSig = sign(BODY, ID, TS, SECRET, currentKey);
    const header = `${oldSig} ${currentSig}`;
    expect(verifyPolarWebhook(BODY, makeHeaders(header))).toBe(true);
  });

  it("rejects a tampered body", () => {
    const rawKey = Buffer.from(SECRET, "utf8");
    const sig = sign(BODY, ID, TS, SECRET, rawKey);
    const tampered = BODY.replace('"id":"x"', '"id":"y"');
    expect(verifyPolarWebhook(tampered, makeHeaders(sig))).toBe(false);
  });

  it("rejects wrong secrets", () => {
    const sig = sign(BODY, ID, TS, SECRET, Buffer.from("wrong-secret", "utf8"));
    expect(verifyPolarWebhook(BODY, makeHeaders(sig))).toBe(false);
  });

  it("rejects stale timestamps (replay protection)", () => {
    const rawKey = Buffer.from(SECRET, "utf8");
    const staleTs = String(Math.floor(Date.now() / 1000) - 60 * 60);
    const sig = sign(BODY, ID, staleTs, SECRET, rawKey);
    const h = makeHeaders(sig);
    expect(verifyPolarWebhook(BODY, h)).toBe(false);
  });

  it("rejects bare base64 without the v1 envelope", () => {
    const rawKey = Buffer.from(SECRET, "utf8");
    const digest = createHmac("sha256", rawKey).update(`${ID}.${TS}.${BODY}`).digest("base64");
    expect(verifyPolarWebhook(BODY, makeHeaders(digest))).toBe(false);
  });

  it("returns false when no secret is configured", () => {
    const old = process.env.POLAR_WEBHOOK_SECRET;
    delete process.env.POLAR_WEBHOOK_SECRET;
    try {
      const rawKey = Buffer.from(SECRET, "utf8");
      const sig = sign(BODY, ID, TS, SECRET, rawKey);
      expect(verifyPolarWebhook(BODY, makeHeaders(sig))).toBe(false);
    } finally {
      if (old) process.env.POLAR_WEBHOOK_SECRET = old;
    }
  });
});
