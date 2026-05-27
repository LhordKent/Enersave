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
  await page.waitForTimeout(6000);

  const content = await page.content();
  const hasError = /CONFIGURATION_NOT_FOUND|operation-not-allowed|Authentication failed|Firebase/.test(content);
  const url = page.url();

  console.log(`url=${url}`);
  console.log(`has_error=${hasError}`);
  console.log(`email=${email}`);

  await page.screenshot({ path: "tmp-live-auth-after-signup.png", fullPage: true });
  await browser.close();
})();
