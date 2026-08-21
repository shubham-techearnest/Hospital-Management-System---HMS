# P2-F3 docs (01–14 summary)

**BR:** Structured OPD consultation replaces unstructured free-text-only workflow.

**Stories:** US-CLIN-010 save draft consultation; US-CLIN-011 finalize consultation.

**FR:** OPD-REQ-004 — CC, HPI, exam, assessment, plan; DRAFT editable; FINAL immutable.

**Workflow:** Start encounter → capture sections → Save draft → Finalize → Complete encounter.

**UX:** Form on doctor encounter detail; list shows section summaries + status chip.

**Architecture:** Extend `clinical.notes`; no new table. Content = denormalized summary for legacy readers.

**DB V47:** `chief_complaint`, `hpi`, `examination`, `assessment`, `plan`, `status` (DRAFT|FINAL), `finalized_at`, `finalized_by`.

**API:** POST notes (structured), PUT notes/{id} (draft), POST notes/{id}/finalize.

**RBAC:** `clinical:encounter:write` (MVP).

**Audit:** CLINICAL_NOTE_ADDED, CLINICAL_NOTE_UPDATED, CLINICAL_NOTE_FINALIZED.

**Test:** `StructuredConsultationIntegrationTest`.

**Migration/Release/UAT:** V47 additive; R2; doctor saves draft + finalizes.
