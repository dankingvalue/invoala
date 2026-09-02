import { defineConfig } from "vitest/config";
import path from "node:path";

import os from "node:os";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 30000,
    env: {
      CHROME_PATH:
        os.homedir() +
        "/Library/Caches/ms-playwright/chromium-1234/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
