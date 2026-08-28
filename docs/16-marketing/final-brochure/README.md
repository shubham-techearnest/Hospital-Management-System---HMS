# Health360 Final Brochure Pack

Official **final** A4 tri-fold brochure for Health360 by TechEarnest.

| Item | Path |
|------|------|
| Master HTML | [health360-brochure-final.html](./health360-brochure-final.html) |
| Print types & press rules | [PRINT-TYPES.md](./PRINT-TYPES.md) |
| Images / QR / logos | [assets/](./assets/) |
| Print PDFs | [pdf/](./pdf/) |
| Print entry HTML | [print/](./print/) |
| Regenerate PDFs | [export-pdfs.ps1](./export-pdfs.ps1) |

## Send to the printing machine

1. Prefer **`pdf/01-Health360-Brochure-Final-Full-A4.pdf`** (Type 1 — full double-sided).
2. These PDFs are regenerated with the **high-quality Playwright print pipeline** (`npm run export-pdfs`) — backgrounds on, A4 landscape, zero margins, scale 1.
3. Ask for **A4 landscape**, **tri-fold C-fold**, RGB→CMYK conversion at press, optional **3 mm bleed**.
4. Share **PRINT-TYPES.md** so they know Type 1 vs outside/inside-only proofs.

### Regenerate HQ PDFs

```powershell
cd docs/16-marketing/final-brochure
npm install
npm run export-pdfs
```


## QR destinations

| Placement | Target |
|-----------|--------|
| Front scan + Why CTA | `mailto:info@techearnest.com` |
| Back connect QR | `https://techearnest.com` |
