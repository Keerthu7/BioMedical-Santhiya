# Report Companion

Sandhiya's ME project foundation: a browser-only, multi-report educational demonstration. No external AI service, report persistence, or clinical validation is implemented. Do not use for patient care.

## Run

From this directory: `python -m http.server 8080 --directory dist`, then visit http://localhost:8080.

## Implemented

Paste report text or upload a UTF-8 .txt file (1 MB and 30,000-character limits); synthetic ultrasound, wrist X-ray, and blood examples; keyword matching for four finding groups; conservative context flags; visible unmatched text; linked public medical sources; text explanation download; clear/reset. Multiple finding groups can appear in one report. No negative result establishes a normal report. Reports remain in page memory and downloads only.

Written report photos (JPG/PNG/WebP, up to 10 MB) can be read using Tesseract.js 7.0.0 in the browser. English printed text only. Includes preview, progress, cancellation, a two-minute extraction timeout, editable output, and mandatory confirmation before analysis. Editing extracted text invalidates confirmation. OCR assets are fetched from public CDNs; report images are processed locally. Network access is required for the first engine/language downloads. Actual medical scan images, PDFs, HEIC, and handwriting are unsupported. OCR does not expand the four supported finding groups or establish clinical accuracy.

The matcher is deliberately limited. Sentence context handling is not a clinically reliable negation algorithm. It does not extract or interpret measurements, lab thresholds, detect emergencies, recognize all diagnoses, or establish whether a care option is appropriate. Sources need clinician review and versioned maintenance before real use.

## Next implementation stages

1. Work with the project guide and a clinical advisor to define supported report types and evaluation labels.
2. Add PDF extraction and extend photo OCR with rotation, more languages, and clinically evaluated extraction-quality checks.
3. Build a typed finding schema preserving source text, negation, uncertainty, measurements, and missing context.
4. Add a server-side AI provider with secrets outside browser code, clinician-reviewed retrieval, citation verification, and abstention for unsupported findings.
5. Add clinician review as a real workflow, with consent, access controls, retention rules, and appropriately approved de-identified evaluation data.
6. Evaluate extraction errors, unsupported claims, missed findings, negation failures, and patient comprehension against clinician-reviewed cases.

Suggested dissertation comparison: baseline model versus source-grounded model with validation and abstention. The current prototype is a UI and deterministic baseline, not the final AI system.
