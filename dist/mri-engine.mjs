export const CLASS_IDS = ['glioma', 'meningioma', 'pituitary', 'no_tumour'];
export const CLASS_LABELS = ['Glioma', 'Meningioma', 'Pituitary tumour', 'No tumour'];
export class ModelUnavailableError extends Error {}
export function validateManifest(value) {
  if (!value || value.ready !== true) throw new ModelUnavailableError('A trained MRI model has not been installed. No prediction was generated.');
  if (value.schema !== 1 || !value.version || value.inputName !== 'image' || value.outputName !== 'logits') throw Error('Invalid model contract.');
  if (JSON.stringify(value.classes) !== JSON.stringify(CLASS_IDS)) throw Error('The model class order does not match the website.');
  if (value.width !== 128 || value.height !== 128 || value.channels !== 1 || value.layout !== 'NCHW' || value.normalization !== 'rgb_luma_bilinear_0_1_v1') throw Error('Unsupported preprocessing specification.');
  if (typeof value.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(value.sha256)) throw Error('Missing model checksum.');
  if (value.file !== 'brain-mri.onnx') throw Error('Unexpected model location.');
  if (!Number.isFinite(value.reviewThreshold) || value.reviewThreshold < .25 || value.reviewThreshold > 1) throw Error('Invalid review threshold.');
  return value;
}
export function preprocessRGBA(rgba,width,height) {
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width*height>12000000||rgba.length!==width*height*4)throw Error('Unexpected image dimensions.');
  const luma=(x,y)=>{const i=(y*width+x)*4;return (.299*rgba[i]+.587*rgba[i+1]+.114*rgba[i+2])*rgba[i+3]/(255*255);};
  const out=new Float32Array(128*128);
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){
    const sx=Math.max(0,Math.min(width-1,(x+.5)*width/128-.5)),sy=Math.max(0,Math.min(height-1,(y+.5)*height/128-.5));
    const x0=Math.floor(sx),y0=Math.floor(sy),x1=Math.min(width-1,x0+1),y1=Math.min(height-1,y0+1),dx=sx-x0,dy=sy-y0;
    out[y*128+x]=luma(x0,y0)*(1-dx)*(1-dy)+luma(x1,y0)*dx*(1-dy)+luma(x0,y1)*(1-dx)*dy+luma(x1,y1)*dx*dy;
  }
  return out;
}
export function predictionFromLogits(logits, manifest) {
  if (logits.length !== 4 || !Array.from(logits).every(Number.isFinite)) throw Error('The model returned invalid output.');
  const max=Math.max(...logits),exp=Array.from(logits,x=>Math.exp(x-max)),sum=exp.reduce((a,b)=>a+b,0),scores=exp.map(x=>x/sum);
  const index=scores.indexOf(Math.max(...scores)),review=scores[index]<manifest.reviewThreshold;
  return {status:review?'review_required':'complete',classId:CLASS_IDS[index],label:review?'Inconclusive — review required':CLASS_LABELS[index],topClass:CLASS_LABELS[index],scores,modelVersion:manifest.version,score:scores[index]};
}
export class MRIClassifier {
  constructor({fetcher=(...args)=>globalThis.fetch(...args),loadRuntime=()=>import('./runtime/ort.wasm.min.mjs'),cryptoProvider=globalThis.crypto}={}) { this.fetcher=fetcher;this.loadRuntime=loadRuntime;this.crypto=cryptoProvider;this.pending=null; }
  async load() {
    if(this.pending)return this.pending;
    this.pending=this._load().catch(e=>{this.pending=null;throw e;});return this.pending;
  }
  async _load() {
    const response=await this.fetcher('model/manifest.json',{cache:'no-store'});
    if(!response.ok)throw new ModelUnavailableError('The MRI model configuration could not be loaded.');
    const manifest=validateManifest(await response.json());
    const modelResponse=await this.fetcher('model/'+manifest.file);
    if(!modelResponse.ok)throw new ModelUnavailableError('The trained MRI model file is missing.');
    const bytes=await modelResponse.arrayBuffer();
    const hash=Array.from(new Uint8Array(await this.crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
    if(hash!==manifest.sha256)throw Error('The model file failed its integrity check.');
    const ort=await this.loadRuntime();ort.env.wasm.numThreads=1;ort.env.wasm.wasmPaths=new URL('./runtime/',import.meta.url).href;
    const session=await ort.InferenceSession.create(bytes,{executionProviders:['wasm']});
    if(!session.inputNames.includes('image')||!session.outputNames.includes('logits'))throw Error('The model input/output names are incompatible.');
    return {manifest,ort,session};
  }
  async predict(pixels) {
    if(pixels.length!==128*128||!Array.from(pixels).every(x=>Number.isFinite(x)&&x>=0&&x<=1))throw Error('Invalid image tensor.');
    const {manifest,ort,session}=await this.load();
    const result=await session.run({image:new ort.Tensor('float32',pixels,[1,1,128,128])});
    if(!result.logits?.dims || result.logits.dims.join(',')!=='1,4')throw Error('Unexpected model output shape.');
    return predictionFromLogits(result.logits.data,manifest);
  }
}
export function comparePredictions(results) {
  if(results.some(r=>r.status!=='complete'))return 'At least one prediction needs review. No reliable class comparison is available.';
  if(results.length===1)return 'Single-image classification. The predicted class requires professional interpretation.';
  return results[0].classId===results[1].classId?'Both images received the same model label. This does not establish that tumour size or patient condition is unchanged.':'The images received different model labels. This does not establish growth, severity, or treatment response.';
}
export function findingSummary(result) {
  if (!result) return {problem:'Cannot determine a medical problem: no model prediction is available.',nextStep:'Provide the original MRI study and radiologist report for professional review. A trained, evaluated MRI model must be installed before this app can produce a research prediction.'};
  if (result.status !== 'complete') return {problem:'Inconclusive model result. A medical problem has not been established.',nextStep:'Ask a radiologist to review the original MRI study and written report. Do not choose treatment from this result.'};
  if (result.classId === 'no_tumour') return {problem:'The model assigned the no-tumour class. This does not rule out a tumour or other brain conditions.',nextStep:'Review the full MRI and radiologist report with the referring clinician, especially if symptoms persist.'};
  return {problem:`Possible ${CLASS_LABELS[CLASS_IDS.indexOf(result.classId)] || 'abnormality'} suggested by the research model; diagnosis is unconfirmed.`,nextStep:'Have a radiologist review the full MRI study and discuss the report with the referring clinician. Treatment depends on a confirmed diagnosis and cannot be selected from these images or a model label.'};
}
export function escapeHTML(value) {return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function reportHTML(record) {
 const e=escapeHTML;
 return `<!doctype html><html lang="en"><meta charset="utf-8"><title>MRI analysis - ${e(record.patient.name)}</title><style>body{font:16px/1.7 Arial;max-width:900px;padding:35px;margin:auto;color:#183946}h1,h2{color:#176a71}.meta,.notice{padding:18px;background:#edf5f6}article{border:1px solid #ccdadd;margin:20px 0;padding:20px;break-inside:avoid}img{width:250px;height:200px;object-fit:contain;background:#142635}small{color:#526e75}button{padding:12px}@media print{button{display:none}}</style><h1>AI Based Brain Tumor Detection from MRI using Deep Learning</h1><button onclick="print()">Print / Save as PDF</button><div class="meta"><b>Patient:</b> ${e(record.patient.name)}<br><b>ID:</b> ${e(record.patient.id)}<br><b>Created:</b> ${e(record.createdAt)}<br><b>Analysis status:</b> ${e(record.status)}</div>${record.results.map((r,i)=>`<article><h2>Scan ${i?'B':'A'}: ${e(r.label)}</h2><p><b>Problem / finding:</b> ${e(findingSummary(r).problem)}</p><p><b>Next step:</b> ${e(findingSummary(r).nextStep)}</p><p>File: ${e(r.filename)}</p>${/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(r.preview||'')?`<img src="${r.preview}" alt="Reduced scan preview">`:''}<p>Model version: ${e(r.modelVersion)}</p><p>Top class: ${e(r.topClass)} · Score: ${(r.score*100).toFixed(1)}%</p><small>Uncalibrated model score, not a probability of disease.</small></article>`).join('')}<p>${e(record.summary)}</p><div class="notice">Research prototype. Not a medical diagnosis. A no-tumour prediction does not certify patient health. Tumour size, grade, growth and treatment are not determined. Image previews are reduced resolution.</div></html>`;
}


