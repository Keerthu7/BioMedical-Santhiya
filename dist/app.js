import {analyze,samples} from './engine.mjs';
import {recognizeImage} from './ocr.js';
const $=id=>document.getElementById(id);let downloadText='';const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function changed(){$('count').textContent=`${$('report').value.length.toLocaleString()} / 30,000`;$('results').innerHTML='<div class="empty"><span>✧</span><h3>Ready when you are</h3><p>Select Explore report to review the current text.</p></div>';$('download').hidden=true;downloadText='';$('error').textContent='';}
let controller,previewUrl,operation=0,requiresReview=false;
function resetUpload(){operation++;controller?.abort();controller=undefined;if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=undefined;$('preview').removeAttribute('src');$('image-panel').hidden=true;$('ocr-review').hidden=true;$('confirmed').checked=false;requiresReview=false;setBusy(false);}
function setBusy(busy){$('analyze').disabled=busy;$('report').readOnly=busy;$('cancel-ocr').hidden=!busy;$('ocr-progress').hidden=!busy;}
$('report').addEventListener('input',()=>{if(requiresReview)$('confirmed').checked=false;changed();});
document.querySelectorAll('[data-sample]').forEach(b=>b.onclick=()=>{resetUpload();$('report').value=samples[b.dataset.sample];$('filename').textContent='Synthetic example';$('file').value='';changed();});
$('cancel-ocr').onclick=()=>{resetUpload();$('file').value='';$('filename').textContent='No file selected';$('ocr-status').textContent='';changed();$('error').textContent='Text extraction canceled. Choose another image or paste report text.';};
$('file').onchange=async()=>{
 const file=$('file').files[0];if(!file)return;resetUpload();const current=operation;
 const isText=/\.txt$/i.test(file.name),isImage=/\.(jpe?g|png|webp)$/i.test(file.name);
 if((!isText&&!isImage)||file.size>(isText?1048576:10485760)){$('error').textContent='Choose JPG, PNG or WebP up to 10 MB, or TXT up to 1 MB. Convert PDF/HEIC to a supported image first.';$('file').value='';return;}
 $('report').value='';$('filename').textContent=file.name;changed();setBusy(true);
 let timer;
 try{
  let value;
  if(isText){value=await file.text();}else{
   previewUrl=URL.createObjectURL(file);$('preview').src=previewUrl;$('image-panel').hidden=false;$('ocr-status').textContent='Loading text reader… First use requires an internet connection.';$('ocr-progress').value=0;
   controller=new AbortController();timer=setTimeout(()=>controller?.abort(),120000);
   value=await recognizeImage(file,{signal:controller.signal,onProgress:(status,progress)=>{if(current!==operation)return;$('ocr-status').textContent=status==='recognizing text'?`Reading report text… ${Math.round(progress*100)}%`:'Preparing text reader…';$('ocr-progress').value=progress;}});
  }
  if(current!==operation)return;
  if(value.length>30000||value.includes('\u0000'))throw Error('Use a plain text report with at most 30,000 characters.');
  if(value.trim().length<15)throw Error('Not enough readable text was found. Use a clearer photo of the written report, not the scan picture, or paste its text.');
  $('report').value=value;changed();
  if(isImage){requiresReview=true;$('ocr-review').hidden=false;$('ocr-status').textContent='Text extracted. Compare and correct it below before continuing.';}
 }catch(e){if(current!==operation)return;$('error').textContent=e.name==='AbortError'?'Text extraction timed out. Try a smaller, clearer image or paste the text.':e.message;if(isImage)$('ocr-status').textContent='Text extraction did not complete.';}
 finally{clearTimeout(timer);if(current===operation){controller=undefined;setBusy(false);}}
};
$('clear').onclick=()=>{resetUpload();$('report').value='';$('file').value='';$('filename').textContent='No file selected';changed();};
$('analyze').onclick=()=>{if(requiresReview&&!$('confirmed').checked){$('error').textContent='Review and correct the extracted text, then tick the confirmation box.';return;}const text=$('report').value.trim();if(text.length<15){$('error').textContent='Paste at least 15 characters of report text or try a synthetic example.';return;}$('error').textContent='';const result=analyze(text);
let html=`<div class="summary"><strong>${esc(result.type)}</strong><br>${result.findings.length} example finding group(s) matched. Classification is a keyword estimate; review the original report.</div>`;
html+=result.findings.map(f=>`<article class="finding"><h3>${esc(f.title)}</h3><div class="body"><span class="status">${f.review?'Context uncertain — clinical review required':'Unverified keyword match'}</span><blockquote>${esc(f.evidence.join('\n'))}</blockquote>${f.review?'<p>Negation, uncertainty, or historical wording was detected. No care pathway is assigned to this mention. Ask a clinician to interpret it.</p>':`<p>${esc(f.meaning)}</p><h4>Possible pathways to discuss</h4><ul>${f.options.map(o=>`<li>${esc(o)}</li>`).join('')}</ul><h4>Information still needed</h4><p>${esc(f.missing)}</p><h4>Who can help</h4><p>${esc(f.specialist)}</p>`}<a href="${f.url}" target="_blank" rel="noopener noreferrer">${esc(f.source)}</a><p class="muted">Source checked 22 November 2026 · not clinician validated.</p></div></article>`).join('');
if(!result.findings.length)html+='<p>No supported finding terminology was matched. This does not establish that the report is normal. This report needs clinician review.</p>';
html+='<details open><summary>Text not interpreted by this prototype</summary><p class="unmatched">'+esc(result.unmatched.join('\n')||'No additional text. This does not confirm full interpretation.')+'</p></details><p class="muted">Ask your doctor: Which findings are confirmed? Which need further tests? What options fit my history and symptoms? How soon should I follow up?</p>';
$('results').innerHTML=html;downloadText='REPORT COMPANION — UNVALIDATED RESEARCH DEMONSTRATION\nNot a diagnosis, prescription, or emergency assessment.\n\n'+$('results').innerText;$('download').hidden=false;};
$('download').onclick=()=>{const url=URL.createObjectURL(new Blob([downloadText],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='report-companion-explanation.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
