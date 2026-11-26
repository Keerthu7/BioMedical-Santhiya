import {haemorrhageCase,demonstrationReportHTML} from './haemorrhage-case.mjs';
import {MRIClassifier as MRIModel,ModelUnavailableError,preprocessRGBA,CLASS_LABELS,comparePredictions,reportHTML,findingSummary} from './mri-engine.mjs';
const $=s=>document.querySelector(s),KEY='neurotwin.mri.history.v1';
const state={model:new MRIModel(),slots:[null,null],revision:[0,0],loading:[false,false],generation:0,busy:false,records:[],record:null,storageOK:true,selected:null};
let toastTimer;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),5000);}
function add(host,tag,value,cls){const el=document.createElement(tag);el.textContent=value??'';if(cls)el.className=cls;host.append(el);return el;}
function button(host,label,fn,cls='secondary'){const b=add(host,'button',label,cls);b.type='button';b.addEventListener('click',fn);return b;}
function available(){const count=state.slots.filter(Boolean).length;$('#analyse').disabled=!(state.slots[0]||($('#haemorrhage-demo').checked&&state.slots[1]))||state.loading.some(Boolean)||state.busy;$('#analyse').textContent=state.busy?'Analysing MRI…':$('#haemorrhage-demo').checked?'Analyse MRI · Demo':'Analyse MRI';$('#clear').disabled=!count&&!state.loading.some(Boolean)&&!state.busy;}
function invalidate(){state.generation++;state.busy=false;state.record=null;$('#result-panel').hidden=true;$('#error').textContent='';available();}
function navigate(){const activity=location.hash==='#activity';$('#analysis').hidden=activity;$('#activity').hidden=!activity;$('#analysis-tab').classList.toggle('active',!activity);$('#activity-tab').classList.toggle('active',activity);if(activity)history();}
window.addEventListener('hashchange',navigate);
$('#scan-grid').innerHTML=[0,1].map(i=>`<article class="scan-card" id="scan-${i}"><div class="scan-head"><strong>Scan ${i?'B':'A'}</strong><span>${i?'Optional comparison':'Required image'}</span></div><div class="preview-stage"><div class="preview-empty"><span>＋</span><strong>No MRI image selected</strong></div><img alt="Uploaded brain MRI" hidden><div class="filename"></div></div><div class="upload-controls"><button class="upload-button" type="button" aria-label="Upload scan ${i?'B':'A'}">Choose MRI image</button><input type="file" accept="image/jpeg,image/png,image/webp" hidden><p>PNG, JPG or WEBP · Up to 10 MB</p></div></article>`).join('');
[0,1].forEach(i=>{const card=$(`#scan-${i}`);card.querySelector('button').addEventListener('click',()=>card.querySelector('input').click());card.querySelector('input').addEventListener('change',e=>{const file=e.target.files[0];e.target.value='';upload(i,file);});});
async function upload(i,file){
 if(!file)return;
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)){toast('Choose PNG, JPG or WEBP. Text reports, PDFs and DICOM are not supported.');return;}
 if(file.size>10485760){toast('Choose an image smaller than 10 MB.');return;}
 const revision=++state.revision[i];state.loading[i]=true;invalidate();available();let url;
 try{url=URL.createObjectURL(file);const image=new Image();image.src=url;await image.decode();if(image.width*image.height>12000000)throw Error('Choose an image below 12 megapixels.');
 const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);const data=preprocessRGBA(ctx.getImageData(0,0,image.width,image.height).data,image.width,image.height);
 const preview=document.createElement('canvas');preview.width=320;preview.height=240;const pc=preview.getContext('2d');pc.fillStyle='#142b3d';pc.fillRect(0,0,320,240);const scale=Math.min(320/image.width,240/image.height);pc.drawImage(image,(320-image.width*scale)/2,(240-image.height*scale)/2,image.width*scale,image.height*scale);
 if(revision!==state.revision[i]){URL.revokeObjectURL(url);return;}
 if(state.slots[i]?.url)URL.revokeObjectURL(state.slots[i].url);state.slots[i]={url,data,filename:file.name,preview:preview.toDataURL('image/jpeg',.7)};const card=$(`#scan-${i}`);card.querySelector('img').src=url;card.querySelector('img').hidden=false;card.querySelector('.preview-empty').hidden=true;card.querySelector('.filename').textContent=`${file.name} · ${image.width} × ${image.height}`;card.querySelector('button').textContent='Replace MRI image';
 }catch(e){if(url)URL.revokeObjectURL(url);if(revision===state.revision[i])toast(e.message.startsWith('Choose')?e.message:'This file could not be decoded. Choose a readable image.');}
 finally{if(revision===state.revision[i]){state.loading[i]=false;available();}}
}
$('#clear').addEventListener('click',()=>{state.slots.forEach(s=>{if(s?.url)URL.revokeObjectURL(s.url);});state.slots=[null,null];state.revision=state.revision.map(x=>x+1);state.loading=[false,false];invalidate();state.busy=false;[0,1].forEach(i=>{const card=$(`#scan-${i}`);card.querySelector('img').removeAttribute('src');card.querySelector('img').hidden=true;card.querySelector('.preview-empty').hidden=false;card.querySelector('.filename').textContent='';card.querySelector('button').textContent='Choose MRI image';});available();});
$('#analysis-form').addEventListener('input',()=>{invalidate();state.busy=false;available();});
$('#analysis-form').addEventListener('submit',async e=>{
 e.preventDefault();if($('#analyse').disabled)return;
 const patientName=$('#patient-name').value.trim();if(!patientName){$('#patient-name').setCustomValidity('Enter a patient name.');$('#patient-name').reportValidity();return;}
 if($('#haemorrhage-demo').checked){renderDemonstration(patientName);return;}
 const generation=++state.generation;state.busy=true;available();$('#error').textContent='';$('#result-panel').hidden=true;
 try{await state.model.load();if(generation!==state.generation)return;const results=[];
 for(const slot of state.slots.filter(Boolean)){const prediction=await state.model.predict(slot.data);if(generation!==state.generation)return;results.push({...prediction,filename:slot.filename,preview:slot.preview});}
 const patientID=$('#patient-id').value.trim()||`NT-${crypto.randomUUID().slice(0,8).toUpperCase()}`;$('#patient-id').value=patientID;
 const record={schema:1,id:crypto.randomUUID(),patient:{name:patientName,id:patientID},createdAt:new Date().toISOString(),status:'completed',results,summary:comparePredictions(results)};state.record=record;
 let saveStatus='Saved in Activity on this browser.';
 try{if(!state.storageOK)throw Error();if(state.records.length>=100)throw Error();const next=[record,...state.records];localStorage.setItem(KEY,JSON.stringify(next));state.records=next;state.selected=record.id;}catch{saveStatus='This analysis was not saved in browser history. Download the report to keep it.';}
 render(record,saveStatus);history();$('#model-status').textContent='MRI model ready';
 }catch(error){if(generation!==state.generation)return;const host=$('#result-panel');host.replaceChildren();host.hidden=false;const box=add(host,'div','','unavailable');add(box,'h3',error instanceof ModelUnavailableError?'Model not configured':'Analysis did not complete');add(box,'p',error.message);add(box,'p','No tumour label, score, or medical finding has been generated.');const grid=add(host,'div','','result-grid');state.slots.forEach((slot,i)=>{if(!slot)return;const card=add(grid,'article','','finding');add(card,'h3',`Scan ${i?'B':'A'}`);add(card,'p',slot.filename);const summary=findingSummary(null);add(card,'strong','Problem / கண்டறிதல் நிலை');add(card,'p',summary.problem);add(card,'strong','Next step / அடுத்த படி');add(card,'p',summary.nextStep);});$('#model-status').textContent='No prediction available';}
 finally{if(generation===state.generation){state.busy=false;available();$('#result-panel').scrollIntoView({behavior:'smooth',block:'start'});}}
});
$('#patient-name').addEventListener('input',()=>$('#patient-name').setCustomValidity(''));
function renderDemonstration(patientName){
 const host=$('#result-panel'),c=haemorrhageCase;host.replaceChildren();host.hidden=false;
 add(host,'p',c.provenance,'notice');
 const head=add(host,'div','','result-heading');add(head,'h2',c.title);
 const scans=state.slots.flatMap((slot,i)=>slot?[{slot:i?'B':'A',filename:slot.filename,preview:slot.preview}]:[]);
 button(head,'Download demonstration report',()=>{
  const url=URL.createObjectURL(new Blob([demonstrationReportHTML(patientName,scans)],{type:'text/html;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='Haemorrhage_Demonstration.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
 });
 add(host,'p',`Demonstration name: ${patientName}`);
 const grid=add(host,'div','','result-grid');scans.forEach(scan=>{const card=add(grid,'article','','finding');add(card,'h3',`Scan ${scan.slot}`);const img=add(card,'img','');img.src=scan.preview;img.alt=`Scan ${scan.slot} case illustration`;img.style.maxWidth='100%';add(card,'p',scan.filename);add(card,'p','Case label supplied by user: brain haemorrhage. No image inference performed.');});
 c.sections.forEach(section=>{const block=add(host,'section','','finding');add(block,'h3',section.title);const list=add(block,'ul','');section.items.forEach(item=>add(list,'li',item));});
 const reference=add(host,'p','Clinical reference: ');const link=add(reference,'a','AHA/ASA intracerebral haemorrhage guideline');link.href='https://www.ahajournals.org/doi/10.1161/STR.0000000000000407';
 add(host,'p','General educational information. Demonstrations are not saved as completed AI analyses.','muted');
 host.scrollIntoView({behavior:'smooth',block:'start'});
}
function download(record){const url=URL.createObjectURL(new Blob([reportHTML(record)],{type:'text/html;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`MRI_Report_${record.patient.name.replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,50)}.html`;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('Report downloaded. Open it to print or save as PDF.');}
function render(record,message){const host=$('#result-panel');host.replaceChildren();host.hidden=false;const head=add(host,'div','','result-heading');add(head,'h2','MRI classification results');button(head,'Download patient report',()=>download(record));const meta=add(host,'div','','result-meta');add(meta,'strong',record.patient.name);add(meta,'span',record.patient.id);add(meta,'span',new Date(record.createdAt).toLocaleString('en-IN'));const grid=add(host,'div','','result-grid');record.results.forEach((r,i)=>{const card=add(grid,'article','','finding');add(card,'small',`SCAN ${i?'B':'A'} · MODEL ${r.modelVersion}`);add(card,'h3',r.label);const summary=findingSummary(r);add(card,'strong','Problem / கண்டறிதல் நிலை');add(card,'p',summary.problem);add(card,'strong','Next step / அடுத்த படி');add(card,'p',summary.nextStep);add(card,'p',r.status==='review_required'?'The model score is below the configured review threshold. No confident class label is assigned.':'Research classification. This does not establish a medical diagnosis.');r.scores.forEach((s,j)=>{const row=add(card,'div','','score');add(row,'span',CLASS_LABELS[j]);add(row,'span',`${(s*100).toFixed(1)}%`);const track=add(card,'div','','track');const bar=add(track,'div','');bar.style.width=`${s*100}%`;});add(card,'p',r.filename);});add(host,'p',record.summary,'summary');add(host,'p',message,'muted');}
function validRecord(r){return r?.schema===1&&typeof r.id==='string'&&typeof r.patient?.name==='string'&&typeof r.patient?.id==='string'&&Number.isFinite(Date.parse(r.createdAt))&&typeof r.summary==='string'&&Array.isArray(r.results)&&r.results.length>0&&r.results.length<=2&&r.results.every(p=>typeof p.label==='string'&&Number.isFinite(p.score)&&p.score>=0&&p.score<=1&&Array.isArray(p.scores)&&p.scores.length===4&&p.scores.every(Number.isFinite));}
function history(){const q=$('#search').value.toLowerCase().trim();$('#record-count').textContent=state.records.length;const host=$('#records');host.replaceChildren();const filtered=state.records.filter(r=>(r.patient.name+' '+r.patient.id).toLowerCase().includes(q));if(!filtered.length)add(host,'p',q?'No matching analyses.':'No completed MRI analyses yet. A trained model is required before a prediction can be saved.','muted');filtered.forEach(record=>{const row=button(host,'',()=>{state.selected=record.id;history();},`record ${state.selected===record.id?'selected':''}`);add(row,'strong',record.patient.name);add(row,'small',record.patient.id);add(row,'small',new Date(record.createdAt).toLocaleString('en-IN'));});const selected=state.records.find(r=>r.id===state.selected);if(selected){const side=$('#record-detail');side.replaceChildren();add(side,'h3',selected.patient.name);add(side,'p',selected.patient.id);add(side,'p',selected.summary);selected.results.forEach((r,i)=>add(side,'p',`Scan ${i?'B':'A'}: ${r.label}`));button(side,'Download patient report',()=>download(selected));}}
$('#search').addEventListener('input',history);
try{const saved=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(saved)||!saved.every(validRecord))throw Error();state.records=saved;}catch{state.storageOK=false;toast('History storage is unavailable. Current reports can still be downloaded.');}
available();history();navigate();
state.model.load().then(()=>$('#model-status').textContent='MRI model ready').catch(error=>{$('#model-status').textContent=error instanceof ModelUnavailableError?'Trained MRI model not installed':'MRI model could not be loaded';});
