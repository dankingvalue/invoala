import { describe, expect, it } from "vitest";
import { normalizeEmail, hashEmail } from "@/lib/trial";

describe("normalizeEmail", () => {
  it("strips +alias suffixes on any provider", () => {
    expect(normalizeEmail("jane+trial1@example.com")).toBe("jane@example.com");
    expect(normalizeEmail("jane+trial2@example.com")).toBe("jane@example.com");
  });

  it("strips dots only for gmail/googlemail", () => {
    expect(normalizeEmail("j.a.n.e@gmail.com")).toBe("jane@gmail.com");
    expect(normalizeEmail("j.a.n.e@googlemail.com")).toBe("jane@googlemail.com");
    expect(normalizeEmail("j.a.n.e@example.com")).toBe("j.a.n.e@example.com");
  });

  it("combines +alias and dot stripping for gmail", () => {
    expect(normalizeEmail("Jane.Doe+scam@gmail.com")).toBe("janedoe@gmail.com");
    expect(normalizeEmail("janedoe@gmail.com")).toBe("janedoe@gmail.com");
  });

  it("lowercases and trims", () => {
    expect(normalizeEmail("  Jane@Example.COM  ")).toBe("jane@example.com");
  });
});

describe("hashEmail", () => {
  it("produces identical hashes for aliases of the same inbox", () => {
    expect(hashEmail("jane+a@gmail.com")).toBe(hashEmail("j.a.n.e@gmail.com"));
    expect(hashEmail("jane+a@gmail.com")).toBe(hashEmail("jane@gmail.com"));
  });

  it("produces different hashes for genuinely different inboxes", () => {
    expect(hashEmail("jane@example.com")).not.toBe(hashEmail("john@example.com"));
  });
});
