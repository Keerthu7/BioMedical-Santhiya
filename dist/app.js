import {analyze} from './engine.mjs';
import {recognizeImage} from './ocr.js';
import {isDemoImage,demoMarkup} from './demo-case.mjs';
const $=id=>document.getElementById(id);
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let downloadText='',controller,previewUrl,pendingImage,operation=0,fromImage=false,demoSelected=false;
function changed(){
 $('count').textContent=`${$('report').value.length.toLocaleString()} / 30,000`;
 $('results').innerHTML='<div class="empty"><span>✧</span><h3>Ready to analyse</h3><p>Click Analyse report to see matched problems and possible care options.</p></div>';
 $('download').hidden=true;downloadText='';$('error').textContent='';
}
function setBusy(busy){$('analyze').disabled=busy;$('analyze').textContent=busy?'Analysing report…':'Analyse report';$('report').readOnly=busy;$('cancel-ocr').hidden=!busy;$('ocr-progress').hidden=!busy;}
function resetUpload(){
 operation++;controller?.abort();controller=undefined;pendingImage=undefined;fromImage=false;demoSelected=false;
 if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=undefined;
 $('preview').removeAttribute('src');$('preview').hidden=false;$('image-panel').hidden=true;$('ocr-review').hidden=true;$('text-details').hidden=true;setBusy(false);
}
function validateText(value){
 if(value.length>30000||value.includes('\u0000'))throw Error('Use a readable report with at most 30,000 characters.');
 if(value.trim().length<15)throw Error('Not enough readable text was found. Choose a clearer photo of the written report, or paste its text.');
}
$('report').addEventListener('input',changed);
$('cancel-ocr').onclick=()=>{
 resetUpload();$('file').value='';$('report').value='';$('filename').textContent='No file selected';changed();$('error').textContent='Analysis canceled. Choose a report to try again.';
};
$('file').onchange=async()=>{
 const file=$('file').files[0];if(!file)return;resetUpload();const current=operation;
 $('report').value='';$('filename').textContent='No file selected';changed();
 const isText=/\.txt$/i.test(file.name),isImage=/\.(jpe?g|png|webp)$/i.test(file.name);
 if((!isText&&!isImage)||file.size>(isText?1048576:10485760)){
  $('error').textContent='Choose JPG, PNG or WebP up to 10 MB, or TXT up to 1 MB. PDF and HEIC are not supported.';$('file').value='';return;
 }
 $('filename').textContent=file.name;
 if(isImage){
  setBusy(true);
  try{
   const matched=await isDemoImage(file);if(current!==operation)return;demoSelected=matched;$('image-panel').hidden=false;$('text-details').open=false;
   if(matched){$('preview').hidden=true;$('filename').textContent='Demo image selected';$('ocr-status').textContent='Image selected';}
   else{pendingImage=file;previewUrl=URL.createObjectURL(file);$('preview').src=previewUrl;$('ocr-status').textContent='Image ready';}
  }catch(e){if(current===operation)$('error').textContent='Could not read this image. Choose the file again.';}
  finally{if(current===operation)setBusy(false);}
  return;
 }
 setBusy(true);
 try{const value=await file.text();if(current!==operation)return;validateText(value);$('report').value=value;$('text-details').hidden=false;$('text-details').open=false;changed();}
 catch(e){if(current===operation)$('error').textContent=e.message;}
 finally{if(current===operation)setBusy(false);}
};
$('clear').onclick=()=>{resetUpload();$('report').value='';$('file').value='';$('filename').textContent='No file selected';changed();};
$('analyze').onclick=async()=>{
 const current=operation;let timer;setBusy(true);$('error').textContent='';
 try{
  if(demoSelected){
   $('results').innerHTML=demoMarkup;$('ocr-status').textContent='Complete';
   downloadText='REPORT COMPANION — DEMO CASE / PREDEFINED RESULT\nNot a diagnosis or scan analysis.\n\n'+$('results').innerText;$('download').hidden=false;return;
  }
  if(pendingImage){
   controller=new AbortController();const activeController=controller;timer=setTimeout(()=>activeController.abort(),120000);
   $('ocr-status').textContent='Reading the report image…';$('ocr-progress').value=0;
   const value=await recognizeImage(pendingImage,{signal:activeController.signal,onProgress:(status,progress)=>{
    if(current!==operation)return;$('ocr-status').textContent=status==='recognizing text'?`Reading report text… ${Math.round(progress*100)}%`:'Preparing text reader…';$('ocr-progress').value=progress;
   }});
   if(current!==operation)return;validateText(value);$('report').value=value;pendingImage=undefined;fromImage=true;changed();$('ocr-review').hidden=false;$('text-details').hidden=false;
  }
  if(current!==operation)return;const text=$('report').value.trim();validateText(text);renderResult(text);
  if(fromImage)$('ocr-status').textContent='Complete';
 }catch(e){
  if(current!==operation)return;$('error').textContent=e.name==='AbortError'?'Analysis timed out. Try a smaller image or paste the text.':e.message;
  if(previewUrl)$('ocr-status').textContent='Analysis did not complete. You can retry or choose another image.';
 }finally{clearTimeout(timer);if(current===operation){controller=undefined;setBusy(false);}}
};
function renderResult(text){
 const result=analyze(text);
 let html=`<div class="summary"><strong>${esc(result.type)}</strong><br>${result.findings.length} supported finding group(s) matched. These are unverified text matches, not confirmed diagnoses.${fromImage?' Results use automatically extracted image text; check it against the original.':''}</div>`;
 html+=result.findings.map(f=>`<article class="finding"><h3>Problem mentioned: ${esc(f.title)}</h3><div class="body"><span class="status">${f.review?'Context uncertain — clinical review required':'Unverified keyword match'}</span><blockquote>${esc(f.evidence.join('\n'))}</blockquote>${f.review?'<p>Negation, uncertainty, or historical wording was detected. A current problem cannot be confirmed from this mention. No care options are assigned.</p>':`<h4>What it means</h4><p>${esc(f.meaning)}</p><h4>Possible solutions / care options</h4><ul>${f.options.map(o=>`<li>${esc(o)}</li>`).join('')}</ul><h4>Information still needed</h4><p>${esc(f.missing)}</p><h4>Who can help</h4><p>${esc(f.specialist)}</p>`}<a href="${f.url}" target="_blank" rel="noopener noreferrer">${esc(f.source)}</a><p class="muted">Source checked 22 November 2026 · not clinician validated.</p></div></article>`).join('');
 if(!result.findings.length)html+='<p>No supported problem was identified by this limited prototype. This does not mean your report is normal. Ask a clinician to interpret the report.</p>';
 html+='<details><summary>Text not interpreted by this prototype</summary><p class="unmatched">'+esc(result.unmatched.join('\n')||'No additional text. This does not confirm full interpretation.')+'</p></details><p class="muted">Discuss these options with your doctor. The right treatment depends on your symptoms, history, examination, and any further tests.</p>';
 $('results').innerHTML=html;downloadText='REPORT COMPANION — UNVALIDATED RESEARCH DEMONSTRATION\nNot a diagnosis, prescription, or emergency assessment.\n\n'+$('results').innerText+'\n\nREPORT TEXT USED\n'+text;$('download').hidden=false;
}
$('download').onclick=()=>{const url=URL.createObjectURL(new Blob([downloadText],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='report-companion-explanation.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
