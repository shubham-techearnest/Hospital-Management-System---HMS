/**
 * High-quality print PDF export for Health360 Final Brochure.
 * Uses Playwright Chromium print pipeline (preferCSSPageSize + printBackground).
 *
 * Usage:
 *   npm install
 *   npm run export-pdfs
 */
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const pdfDir = path.join(root, "pdf");
const htmlPath = path.join(root, "health360-brochure-final.html");

const jobs = [
  { query: "", name: "01-Health360-Brochure-Final-Full-A4.pdf", label: "Type 1 Full" },
  { query: "?capture=outside", name: "02-Health360-Brochure-Final-Outside-A4.pdf", label: "Type 2 Outside" },
  { query: "?capture=inside", name: "03-Health360-Brochure-Final-Inside-A4.pdf", label: "Type 3 Inside" },
];

async function exportOne(page, fileUrl, outPath) {
  await page.goto(fileUrl, { waitUntil: "networkidle", timeout: 120000 });
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const imgs = Array.from(document.images);
    await Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", resolve, { once: true });
            })
      )
    );
  });
  await new Promise((r) => setTimeout(r, 1000));

  await page.pdf({
    path: outPath,
    preferCSSPageSize: true,
    printBackground: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
    scale: 1,
  });
}

async function main() {
  if (!fs.existsSync(htmlPath)) throw new Error("Missing health360-brochure-final.html");
  fs.mkdirSync(pdfDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--allow-file-access-from-files",
      "--font-render-hinting=none",
      "--disable-lcd-text",
      "--force-color-profile=srgb",
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 3508, height: 2480 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.emulateMedia({ media: "print" });

  for (const job of jobs) {
    const outPath = path.join(pdfDir, job.name);
    const fileUrl = "file:///" + htmlPath.replace(/\\/g, "/") + job.query;
    process.stdout.write(`Exporting ${job.label} → ${job.name} ... `);
    await exportOne(page, fileUrl, outPath);
    const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
    console.log(`OK (${kb} KB)`);
  }

  await browser.close();
  console.log("High-quality PDFs ready in:", pdfDir);
  console.log("Press tip: convert RGB→CMYK at the print shop for coated stock.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
