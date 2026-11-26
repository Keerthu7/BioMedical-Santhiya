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

export function demonstrationReportHTML(patient) {
 const e=escapeHTML,c=haemorrhageCase;
 return `<!doctype html><html lang="en"><meta charset="utf-8"><title>Haemorrhage case summary</title><style>body{font:16px/1.7 Arial;max-width:850px;margin:auto;padding:30px}section{break-inside:avoid}@media print{button{display:none}}</style><p>${e(c.provenance)}</p><p>Name: ${e(patient)}</p><button onclick="print()">Print / Save as PDF</button>${c.sections.map(s=>`<section><h2>${e(s.title)}</h2>${s.intro?`<p>${e(s.intro)}</p>`:''}${s.items.length?`<ul>${s.items.map(t=>`<li>${e(t)}</li>`).join('')}</ul>`:''}</section>`).join('')}</html>`;
}
