const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const email = `qa.${Date.now()}@example.com`;
  const password = "Enersave123!";

  await page.goto("https://enersave-web.vercel.app", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Sign up" }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForTimeout(4000);

  const hasDashboard = await page.getByText("Live Stream Plot").first().isVisible().catch(() => false);
  await page.screenshot({ path: "tmp-live-after-signup-dashboard.png", fullPage: true });

  await browser.close();
  console.log(`email=${email}`);
  console.log(`dashboard_visible=${hasDashboard}`);
})();
