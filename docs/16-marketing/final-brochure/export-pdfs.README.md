# Health360 Final Brochure — regenerate print PDFs (Edge)

Requires Microsoft Edge. Run from this folder:

```powershell
powershell -ExecutionPolicy Bypass -File .\export-pdfs.ps1
```

Outputs (A4 landscape, no margins, background graphics via CSS `@page`):

- `pdf/01-Health360-Brochure-Final-Full-A4.pdf`
- `pdf/02-Health360-Brochure-Final-Outside-A4.pdf`
- `pdf/03-Health360-Brochure-Final-Inside-A4.pdf`
