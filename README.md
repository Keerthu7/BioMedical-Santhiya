# AI Based Brain Tumor Detection from MRI using Deep Learning

The code now implements an MRI-oriented frontend and a real ONNX/CNN integration contract. The former OCR, treatment-option and kidney-stone code is archived under `legacy/`, outside the published `dist/` folder. No sample scans are bundled. An explicitly selected educational haemorrhage case is available separately from model inference.

## Current status

MRI upload and preview, patient details, optional two-image comparison, model loading, preprocessing, output validation, named printable reports and browser Activity history are implemented. **No trained medical model was supplied.** `dist/model/manifest.json` deliberately has `ready: false`. The website displays Model not configured and does not invent tumour labels or scores. History/report prediction flows become available only after actual inference succeeds.

There is no trained-model accuracy claim. Model inference orchestration is software-tested with controlled mocks; this is not a validation of medical performance. DICOM, tumour segmentation, Grad-CAM and actual PDF-file generation are not implemented. Reports download as standalone HTML with Print / Save as PDF.

## Run locally

```powershell
npm ci --ignore-scripts
npm run prepare-runtime
python -m http.server 8080 --directory dist --bind 127.0.0.1
```

Open http://127.0.0.1:8080/. Keep the terminal open. `npm test` runs the software checks. If the runtime has already been prepared, the Python server command alone is sufficient for local preview.

## Vercel

Keep the repository root as Vercel's Root Directory. The updated `vercel.json` runs `npm ci --ignore-scripts`, copies the CPU browser inference runtime into `dist/runtime`, and publishes `dist`. The package lock is included. There is no Python function, paid model API or secret key in this frontend. Inference runs locally in the browser when a compatible model is installed. Do not deploy the root `ml/` or `legacy/` as public assets.

These are local source changes. The deployed Vercel website will update only after the changed repository is redeployed. No push or Vercel publication has been performed by this migration.

## Train a real model

Training requires a licensed, reliably labelled real MRI dataset. The old synthetic fixtures and kidney-stone example are not an MRI training dataset. Group related slices by patient and keep patients in only one split. Four classes are fixed in this order: `glioma`, `meningioma`, `pituitary`, `no_tumour`.

Prepare a CSV with columns `path,patient_id,label,split`. Paths are relative to the dataset root; split is `train`, `val` or `test`. The validator rejects missing files, unsafe paths, unknown labels, patient overlap and incomplete class coverage. Patient grouping must be genuine; do not invent per-image patient IDs to bypass leakage checks.

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r ml/requirements.txt
.\.venv\Scripts\python.exe ml/train.py --manifest path/to/manifest.csv --data-root path/to/mri-dataset --epochs 30
npm run prepare-runtime
```

The training script fits a baseline CNN, selects weights by validation loss, evaluates once on the specified held-out test set, exports `brain-mri.onnx`, checks PyTorch/ONNX numerical agreement, and writes metrics, test predictions and the final model manifest. It has been syntax-checked but has **not been trained or exercised end to end** because no dataset or trained medical artifact was available. The deep-learning dependencies are listed separately and are not installed by the frontend's npm command.

Review test results and the data provenance before deploying the exported files. `dist/model/brain-mri.onnx` must accompany its manifest; it is not ignored by Git. The default 0.7 review threshold is a project operating setting, not a clinically validated decision rule. Choose a threshold using validation data and document its behavior. Do not tune on the final test set. Training accuracy is not test accuracy.

## Model contract

Input: `image`, float32 NCHW `[1,1,128,128]`. Output: `logits`, `[1,4]`. Preprocessing `rgb_luma_bilinear_0_1_v1` is explicit, shared between Python and JavaScript: EXIF-oriented image, alpha over black, RGB luma coefficients 0.299/0.587/0.114, clamped half-pixel bilinear resampling, and scaling to 0-1. The browser rejects incompatible metadata and incorrect SHA-256 weights before executing the model. A filename or file hash is never used as the medical prediction.

Upload formats: PNG/JPEG/WEBP, at most 10 MB and 12 megapixels. PDF/TXT/DICOM/HEIC and corrupt files are rejected. Format validation is not proof that an image is a brain MRI. Out-of-distribution inputs can still produce misleading model scores and require separate evaluation.

## History and reports

Completed analyses can be saved to localStorage (maximum 100 records), including patient text, reduced image previews, model version and scores. There is no account, cloud backup or hospital integration. History is origin/browser/device specific and unencrypted by this application. Use fictional details for demonstrations. Storage failures are reported and do not silently delete old records. Full-resolution scans are not persisted. Patient/report text is escaped on rendering and export.

No-tumour is a dataset label, not a certificate of health. Scores are uncalibrated and cannot be interpreted as disease probabilities. The system does not estimate tumour size, grade, growth, treatment response or suitable treatment. Research use only; qualified clinical interpretation is required.

References: https://onnxruntime.ai/docs/get-started/with-javascript/web.html and https://docs.pytorch.org/docs/stable/onnx.html

## Findings and next steps

Each uploaded scan now has a separate problem/finding and next-step explanation, also included in downloaded reports. Uncertain predictions do not name a confirmed disease; the no-tumour class does not rule out other conditions. Treatment is not inferred from a classification. When inference is unavailable, each uploaded scan explicitly says that no problem can be determined and explains what is needed. These incomplete attempts are not saved as completed predictions.

Use original MRI images appropriate to the model dataset. Colourised, watermarked stock illustrations and screenshots (such as the supplied examples) are not a basis for a clinical diagnosis. Uploading two images does not train or validate the model; the missing trained model remains required for actual detection.

## Haemorrhage case summary

Upload either or both images and click **Analyse MRI** to view one combined educational summary with the requested problem, medical and surgical treatment options, priorities and possible outcomes. There is no case checkbox, model-status message or separate per-scan output. The brief educational label identifies the fixed case text; this flow does not infer a diagnosis from pixels or save it as a completed AI prediction. The ONNX model utilities and historical reports remain available in the code, but the main form now displays the educational case only. A trained haemorrhage model has not been added.

The default model fetch wrapper also preserves the browser fetch receiver, avoiding the previous illegal-invocation error for consumers of the classifier.
