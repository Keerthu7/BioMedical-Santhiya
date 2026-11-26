import {escapeHTML} from './mri-engine.mjs';

export const haemorrhageCase = {
  title: 'Brain Haemorrhage (Intracerebral Bleeding)',
  provenance: 'Demonstration case — supplied by the user. Not an AI detection or a confirmed diagnosis from the uploaded images.',
  sections: [
    {title:'1. What is the problem?',items:[
      'The supplied case describes blood collecting inside brain tissue.',
      'Bleeding can damage nearby brain cells. Swelling and increased pressure inside the skull may affect normal brain function.'
    ]},
    {title:'2A. Medical treatment (without surgery)',items:[
      'In selected cases, clinicians manage bleeding without an operation.',
      'Control blood pressure safely under medical supervision.',
      'Reverse the effects of blood-thinning medication when indicated.',
      'Monitor neurological condition and brain pressure; manage swelling and complications.',
      'Provide specialist stroke-unit or ICU care when necessary.'
    ]},
    {title:'2B. Surgical treatment',items:[
      'Haematoma evacuation: remove collected blood in selected cases.',
      'Decompressive surgery: create space to relieve dangerous pressure in selected cases.',
      'External ventricular drainage (EVD): drain cerebrospinal fluid when indicated, for example with obstructed fluid circulation and hydrocephalus.',
      'Not every haemorrhage requires surgery. The decision depends on location, size, cause, deterioration and the patient’s condition.'
    ]},
    {title:'3. Most important treatment',items:[
      'Immediate emergency medical assessment and measures to limit further bleeding.',
      'Urgent brain imaging, usually CT initially; MRI may be used as clinically appropriate.',
      'Careful blood pressure control, reversal of anticoagulation when indicated, and monitoring of swelling and pressure.',
      'Consider emergency surgery when indicated by dangerous pressure, deterioration or other specialist findings.',
      'Early diagnosis + appropriate medical or surgical care + rehabilitation when clinically safe.',
      'A specialist stroke team and neurosurgeon determine treatment from the actual study and patient’s condition. These examples do not select a treatment for an individual.'
    ]},
    {title:'4. Expected outcome',items:[
      'Possible outcomes, not a prediction for either uploaded image: bleeding may stabilise, swelling may reduce and treatment may limit further damage.',
      'Rehabilitation may help speech, movement and daily activities. Recovery varies; severe disability or death can occur.'
    ]},
    {title:'Project conclusion',items:[
      'Brain haemorrhage is serious. Early diagnosis and appropriate treatment are essential. Some patients need medicines and monitoring; others require surgery.',
      'If a real patient is suspected to have brain bleeding, seek emergency care immediately.'
    ]}
  ]
};

export function demonstrationReportHTML(patient, scans) {
  const e=escapeHTML,c=haemorrhageCase;
  return `<!doctype html><html lang="en"><meta charset="utf-8"><title>Haemorrhage demonstration</title><style>body{font:16px/1.7 Arial;max-width:850px;margin:auto;padding:30px}aside{background:#fff1d6;padding:18px}section{break-inside:avoid}img{width:260px;height:200px;object-fit:contain}@media print{button{display:none}}</style><h1>${e(c.title)}</h1><aside>${e(c.provenance)}</aside><p>Patient / demonstration name: ${e(patient)}</p><button onclick="print()">Print / Save as PDF</button>${scans.map(s=>`<section><h2>Scan ${e(s.slot)}</h2><p>${e(s.filename)} — user-supplied case illustration; no inference performed.</p>${/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(s.preview||'')?`<img src="${s.preview}" alt="Uploaded case illustration">`:''}</section>`).join('')}${c.sections.map(s=>`<section><h2>${e(s.title)}</h2><ul>${s.items.map(t=>`<li>${e(t)}</li>`).join('')}</ul></section>`).join('')}<p>Clinical reference: <a href="https://www.ahajournals.org/doi/10.1161/STR.0000000000000407">AHA/ASA intracerebral haemorrhage guideline</a>. General educational information; not a patient-specific treatment plan.</p></html>`;
}
