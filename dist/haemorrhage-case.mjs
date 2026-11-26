import {escapeHTML} from './mri-engine.mjs';

export const haemorrhageCase = {
  title:'Brain Haemorrhage (Intracerebral Bleeding)',
  provenance:'Educational case summary — not an automated diagnosis.',
  sections:[
    {title:'1. What is the problem?',intro:'Brain Haemorrhage (Intracerebral Bleeding)',items:[
      'Blood collects inside the brain tissue.',
      'The bleeding can damage nearby brain cells.',
      'Swelling may develop around the affected area.',
      'Increased pressure inside the skull can affect normal brain function.'
    ]},
    {title:'2. What are the treatment solutions?',intro:'There are two main approaches.',items:[]},
    {title:'A. Medical treatment (without surgery)',level:3,intro:'Used when the bleeding can be managed without an operation.',items:[
      'Control blood pressure.',
      'Give medicines to reverse blood-thinning medication when appropriate.',
      'Monitor brain pressure and neurological condition.',
      'Manage swelling and other complications.',
      'Provide ICU care when necessary.'
    ]},
    {title:'B. Surgical treatment',level:3,intro:'Surgery may be needed in selected serious cases.',items:[
      'Haematoma evacuation: Remove the collected blood.',
      'Decompressive surgery: Create more space to reduce dangerous pressure.',
      'External ventricular drainage (EVD): Drain excess fluid if bleeding blocks normal fluid circulation.',
      "Not every brain haemorrhage requires surgery. The decision depends on the size, location, cause of bleeding and the patient's condition."
    ]},
    {title:'3. Most important treatment',intro:'Immediate medical assessment and control of bleeding.',items:[
      'Get an urgent CT/MRI assessment.',
      'Control blood pressure safely.',
      'Stop or reverse the effect of blood thinners when indicated.',
      'Monitor brain swelling and pressure.',
      'Consider emergency surgery if there is dangerous pressure, deterioration or another surgical indication.'
    ]},
    {title:'IMPORTANT SOLUTION',level:3,intro:'Early diagnosis + proper blood pressure control + timely medical or surgical treatment + rehabilitation.',items:[
      "The choice between medicine and surgery must be made by a neurosurgeon based on the actual scan and patient's condition."
    ]},
    {title:'4. Expected outcome',items:[
      'Bleeding may stabilize.',
      'Brain swelling may reduce.',
      'Further brain damage may be prevented.',
      'Rehabilitation may help recover speech, movement and daily activities.'
    ]},
    {title:'Project conclusion',intro:'Brain haemorrhage is a serious medical condition. Early diagnosis and appropriate treatment are essential. Some patients can be treated with medicines and monitoring, while others may require surgery.',items:[]}
  ]
};

export function demonstrationReportHTML(patient, report={}) {
 const e=escapeHTML,c=haemorrhageCase;
 const details=typeof patient==='string'?{name:patient}:patient;
 const date=report.createdAt?new Date(report.createdAt):new Date();
 const issued=Number.isFinite(date.getTime())?date.toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'})+' IST':'Not recorded';
 const field=(label,value)=>`<div class="field"><dt>${e(label)}</dt><dd>${e(value??'Not provided')}</dd></div>`;
 const sections=c.sections.map(s=>`<section class="${s.level===3?'subsection':'section'}"><${s.level===3?'h3':'h2'}>${e(s.title)}</${s.level===3?'h3':'h2'}>${s.intro?`<p class="lead">${e(s.intro)}</p>`:''}${s.items.length?`<ol>${s.items.map(t=>`<li>${e(t)}</li>`).join('')}</ol>`:''}</section>`).join('');
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MRI Report - ${e(details.name)}</title><style>
 @page{size:A4;margin:17mm 16mm 19mm}
 *{box-sizing:border-box}body{margin:0;background:#e9eff2;color:#203745;font:14px/1.65 'Segoe UI',Arial,sans-serif}.sheet{max-width:850px;margin:32px auto;background:white;padding:48px 54px;box-shadow:0 6px 28px #163c4914}.masthead{display:flex;justify-content:space-between;gap:25px;border-bottom:3px solid #166f79;padding-bottom:22px}.brand{font-weight:750;font-size:23px;color:#166f79;letter-spacing:-.5px}.eyebrow{font-size:10px;letter-spacing:1.8px;text-transform:uppercase;color:#5d7986}.report-meta{text-align:right;font-size:11px;color:#5b7280}.report-meta strong{display:block;color:#203745;font-size:12px}h1{font-size:27px;line-height:1.3;margin:25px 0 8px;letter-spacing:-.7px}.subtitle{color:#637d8a;font-size:12px;margin:0 0 24px}.patient{border:1px solid #d4e2e6;border-radius:6px;margin-bottom:28px;overflow:hidden}.patient h2{background:#edf5f5;margin:0;padding:9px 16px;font-size:12px;text-transform:uppercase;letter-spacing:1px}.patient dl{display:grid;grid-template-columns:1fr 1fr;margin:0;padding:15px 16px;gap:15px 24px}.field{overflow-wrap:anywhere}dt{font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:#6c818b}dd{margin:3px 0 0;font-size:14px;font-weight:600}h2{font-size:17px;color:#166f79;margin:24px 0 10px;padding-bottom:7px;border-bottom:1px solid #dce7ea;break-after:avoid}h3{font-size:14px;color:#244f5a;margin:19px 0 8px;break-after:avoid}p{margin:8px 0}.lead{font-weight:500}ol{margin:9px 0 17px;padding-left:22px}li{padding-left:5px;margin:6px 0;break-inside:avoid}.subsection{margin-left:12px}.footer{border-top:1px solid #cfdee3;margin-top:30px;padding-top:14px;font-size:10px;color:#6b818b}.footer p{margin:5px 0}.toolbar{max-width:850px;margin:20px auto;text-align:right}.toolbar button{background:#166f79;color:white;border:0;padding:12px 20px;border-radius:5px;cursor:pointer;font:14px Arial}.print-help{font-size:12px;color:#58717f;margin-right:12px}@media(max-width:600px){.sheet{padding:25px;margin:12px}.masthead{flex-direction:column}.report-meta{text-align:left}.patient dl{grid-template-columns:1fr}.toolbar{padding:0 12px}}@media print{body{background:white;font-size:11pt}.sheet{padding:0;margin:0;max-width:none;box-shadow:none}.toolbar{display:none}.masthead,.patient,.footer{break-inside:avoid}.patient dl{grid-template-columns:1fr 1fr}.masthead{flex-direction:row}.report-meta{text-align:right}h2{margin-top:18px}.subsection{margin-left:8px}}
 </style></head><body><div class="toolbar"><span class="print-help">Open this report to print or save a PDF copy.</span><button onclick="print()">Print / Save as PDF</button></div><main class="sheet"><header class="masthead"><div><div class="brand">NeuroTwin</div><div class="eyebrow">Brain MRI • Case report</div></div><div class="report-meta"><strong>${e(report.id||'CASE REPORT')}</strong>Issued: ${e(issued)}</div></header><h1>Brain Haemorrhage Report</h1><p class="subtitle">Educational case reference • Problem, treatment options and possible outcomes</p><section class="patient"><h2>Patient information</h2><dl>${field('Patient name',details.name)}${field('Patient number / ID',details.id)}${field('Age',details.age!==undefined&&details.age!==''?details.age+' years':undefined)}${field('Sex',details.sex)}</dl></section>${sections}<footer class="footer"><p>Educational case reference. Content describes the supplied case; it is not a scan-derived diagnosis or a personalised treatment prescription. Possible outcomes are not guaranteed.</p><p>Clinical decisions require review of the actual imaging and patient by the treating specialist. Suspected brain bleeding requires emergency medical assessment.</p><p>NeuroTwin • ${e(report.id||'Case report')} • Generated ${e(issued)}</p></footer></main></body></html>`;
}
