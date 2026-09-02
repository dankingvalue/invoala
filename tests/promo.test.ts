import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createUserPromo } from "@/lib/promo";

describe("createUserPromo", () => {
  const OLD_TOKEN = process.env.POLAR_ACCESS_TOKEN;

  beforeEach(() => {
    delete process.env.POLAR_ACCESS_TOKEN;
  });

  afterEach(() => {
    if (OLD_TOKEN) process.env.POLAR_ACCESS_TOKEN = OLD_TOKEN;
    else delete process.env.POLAR_ACCESS_TOKEN;
  });

  it("short-circuits to null when Polar is not configured", async () => {
    const promo = await createUserPromo({ id: "u1", email: "a@b.c", name: "A" });
    expect(promo).toBeNull();
  });
});
