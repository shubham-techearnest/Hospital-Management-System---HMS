# Health360 Final Brochure — Print Types & Press Rules

**Product:** Health360 by TechEarnest  
**Source:** `health360-brochure-final.html`  
**Format:** A4 landscape tri-fold (C-fold) · **297 × 210 mm** · **3 × 99 mm** panels  
**Theme:** Purple · Deep Navy · Lavender · White  

Use this guide when instructing a printer or reproducing copies. Each **print type** has a matching PDF under `pdf/`.

---

## Quick pick for the press

| Need | Print type | PDF file |
|------|------------|----------|
| **Commercial double-sided brochure (recommended)** | Type 1 — Full | `pdf/01-Health360-Brochure-Final-Full-A4.pdf` |
| Outside only (side A plate / proof) | Type 2 — Outside | `pdf/02-Health360-Brochure-Final-Outside-A4.pdf` |
| Inside only (side B plate / proof) | Type 3 — Inside | `pdf/03-Health360-Brochure-Final-Inside-A4.pdf` |
| Screen / digital share (same art, RGB) | Type 4 — Digital proof | Open `health360-brochure-final.html` in browser |

---

## Panel map (how the paper is read)

### Outside (print side A) — left → right when flat

| Left panel | Middle panel | Right panel |
|------------|--------------|-------------|
| **Back** (TechEarnest + platform + contact / website QR) | **Why Health360?** (reasons + facts + lead QR) | **Front / cover** (hero + enquire QR) |

### Inside (print side B) — left → right when fully open

| Left panel | Middle panel | Right panel |
|------------|--------------|-------------|
| **Journey** (01–07) | **What patients see & do** | **Connected ecosystem** |

**Fold:** C-fold / letter fold so the **Front** is the outer cover when closed.

---

## Print types (detailed)

### Type 1 — Full double-sided (production)

- **Pages:** 2 (Outside, then Inside)
- **Use:** Final press run for finished brochures
- **PDF:** `pdf/01-Health360-Brochure-Final-Full-A4.pdf`
- **Imposition:** Printer prints page 1 on side A, page 2 on side B, then folds
- **Copies:** Order quantity as needed (typical: 50 / 100 / 250 / 500)

### Type 2 — Outside only (side A)

- **Pages:** 1
- **Use:** Side A plate, color proof, or reprint of cover/back/why only
- **PDF:** `pdf/02-Health360-Brochure-Final-Outside-A4.pdf`
- **HTML capture:** `health360-brochure-final.html?capture=outside`

### Type 3 — Inside only (side B)

- **Pages:** 1
- **Use:** Side B plate, color proof, or reprint of journey/capabilities/ecosystem
- **PDF:** `pdf/03-Health360-Brochure-Final-Inside-A4.pdf`
- **HTML capture:** `health360-brochure-final.html?capture=inside`

### Type 4 — Digital / screen proof (no separate press plate)

- **Use:** Email review, Slack, website download, projector
- **File:** `health360-brochure-final.html` (keep **Background graphics** on if “printing” to PDF again)
- **Note:** Same layout as Type 1; RGB is fine for screen

### Type 5 — Lead / sales handout batch (same art as Type 1)

- **Use:** Exhibitions, hospital visits, sales kits
- **PDF:** Same as Type 1
- **QR intent:**
  - Cover + Why scan → **info@techearnest.com** (lead / demo)
  - Back connect QR → **https://techearnest.com** (website)

### Type 6 — Soft-proof reprint checklist

Before reprinting Type 1, confirm:

1. Logo: Health360 mark + TechEarnest on back  
2. Phone: `+91 20 6708 7147`  
3. Email: `info@techearnest.com`  
4. Address: Office 221, VTP Trade Park, Undri, Pune  
5. Website QR opens `techearnest.com`  
6. Lead QR opens mail to `info@techearnest.com`  

---

## Press specifications (all physical types)

| Spec | Value |
|------|--------|
| Trim size | A4 landscape **297 × 210 mm** |
| Panels | **99 mm** each (3 equal) |
| Margins in file | **None** (artwork already includes safe inset ≈ 4.5 mm) |
| Recommended bleed | Add **3 mm** bleed at press if cutting from larger sheet |
| Color | PDF is high-quality **RGB** with backgrounds preserved; convert to **CMYK** + total ink limit at press for coated stock |
| Resolution | Export via Playwright Chromium print pipeline (`npm run export-pdfs`) — text stays vector; photos embedded full-fidelity from `assets/` |
| Stock (suggested) | 170–250 gsm matte / silk art paper |
| Finish (optional) | Soft-touch laminate or aqueous coat; avoid heavy gloss on QR areas |
| Fold | Tri-fold **C-fold**; score before fold on heavy stock |
| Background graphics | Must be **ON** (always true in `export-pdfs-hq.mjs`) |

### High-quality PDF regeneration (recommended)

From `final-brochure/`:

```powershell
npm install
npm run export-pdfs
```

This writes press-oriented PDFs into `pdf/` using Chromium’s print engine (`preferCSSPageSize`, `printBackground`, scale 1, zero margins). Prefer these over browser “Save as PDF” dialogs when sending to a print shop.

### Chrome / Edge manual export (fallback)

1. Open the HTML (or use `export-pdfs.ps1`).  
2. Print → Save as PDF.  
3. Paper: **A4**, Layout: **Landscape**, Margins: **None**.  
4. Enable **Background graphics**.  
5. For Type 2 / 3, open with `?capture=outside` or `?capture=inside`.

### Printer checklist (quality)

1. Do **not** downscale or “compress for email” before RIP.  
2. Ask for **ISO coated** CMYK conversion (or India press equivalent).  
3. Keep QR modules sharp — no extra sharpening filters.  
4. Soft-proof Type 1 PDF at 100% zoom before the first run.  
5. First article: print 1–2 copies, check fold registration and panel alignment.

---

## Folder contents

```
final-brochure/
  health360-brochure-final.html   ← master editable source
  PRINT-TYPES.md                  ← this file
  README.md
  assets/                         ← images, logos, QR codes
  print/                          ← print-entry HTML shortcuts
  pdf/                            ← press-ready PDF versions
  export-pdfs.ps1                 ← regenerate PDFs via Edge
```

---

## Do not mix

This pack is the **hospital / B2B Health360 brochure**.  
Do **not** replace lead QRs with event registration QRs meant for consumer pamphlets.
