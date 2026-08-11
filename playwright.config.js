// Dev-only test config. The deployed site is still plain HTML/CSS/JS with no build step.
const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:8754",
  },
  projects: [
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
  // Serve the static site on a port separate from the live preview server (8753).
  webServer: {
    command: "python3 -m http.server 8754",
    port: 8754,
    reuseExistingServer: true,
  },
});
