import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const outDir = path.resolve("docs/marketing/videos/live-demo-frames");
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

try {
  await page.goto("https://www.fursbliss.com/walks-left", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, "frame01-walks-landing.png") });

  await page.getByPlaceholder("e.g. Bella").fill("Bella");
  await page.getByPlaceholder("Search breed...").fill("Golden");
  await page.getByRole("button", { name: "Golden Retriever" }).first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, "frame02-walks-filled.png") });

  await page.getByRole("button", { name: "See Your Time Together" }).click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, "frame03-walks-action.png") });

  await page.goto("https://www.fursbliss.com/er-triage-for-dogs", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, "frame04-er-hero.png") });

  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(outDir, "frame05-er-scroll.png") });
} finally {
  await browser.close();
}

console.log(`Saved demo frames to ${outDir}`);
