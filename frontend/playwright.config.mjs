import { defineConfig } from "@playwright/test";

const url = "http://localhost:3187";

export default defineConfig({
    testDir: "./e2e",
    workers: 2,
    use: {
        baseURL: url,
        channel: process.env.SITEPROOF_BROWSER_CHANNEL || undefined,
        trace: "retain-on-failure",
    },
    webServer: {
        command: "npm run start -- --port 3187",
        url,
        reuseExistingServer: false,
    },
});
