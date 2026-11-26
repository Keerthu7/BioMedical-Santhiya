import {haemorrhageCase} from './haemorrhage-case.mjs';

export const lesionCase={
 title:'Brain Lesion (Abnormal Brain Tissue)',
 sections:[
  {title:'1. What is the problem?',intro:'Brain Lesion (Abnormal Brain Tissue)',items:[
   'An abnormal area is present within the brain tissue.',
   'The lesion may be caused by a brain tumor, infection, inflammation, or abnormal tissue growth.',
   'Swelling (edema) may develop around the affected area.',
   'The lesion may put pressure on nearby brain structures.',
   'Depending on its location, it may cause headaches, seizures, weakness, vision problems, or speech difficulties.'
  ]},
  {title:'2. What are the treatment solutions?',intro:'There are two main approaches.',items:[]},
  {title:'A. Medical treatment (without surgery)',level:3,intro:'Used when the lesion does not require immediate surgical removal.',items:[
   'Steroids – to reduce brain swelling when indicated.',
   'Anti-seizure medicines – to control or prevent seizures when appropriate.',
   'Antibiotics or antivirals – if the lesion is caused by infection.',
   'Regular MRI monitoring – to track the size and changes of the lesion.',
   'Targeted medicines – to treat specific tumors or inflammatory conditions.'
  ]},
  {title:'B. Surgical treatment',level:3,intro:'Surgery may be needed in selected cases.',items:[
   'Craniotomy and lesion removal – surgically remove the abnormal tissue.',
   'Biopsy – collect a tissue sample to identify the exact cause.',
   'Minimally invasive surgery – remove or treat selected lesions with less surgical access.',
   'Stereotactic radiosurgery – focused radiation treatment for certain lesions.',
   'Decompression surgery – reduce dangerous pressure on the brain when necessary.',
   'Not every brain lesion requires surgery. Treatment depends on its size, location, cause, and symptoms.'
  ]},
  {title:'3. Most important treatment',intro:'Accurate diagnosis and preventing further damage to brain tissue.',items:[
   'Perform a detailed MRI evaluation, sometimes with contrast.',
   'Identify the exact type and cause of the lesion.',
   'Control swelling and seizures if present.',
   'Decide whether medication, biopsy, surgery, or radiation is necessary.',
   "Monitor the patient's neurological condition and follow-up scans."
  ]},
  {title:'IMPORTANT SOLUTION',level:3,intro:'Early diagnosis + correct identification of the lesion + appropriate treatment + regular monitoring.',items:[]},
  {title:'4. Expected outcome',items:[
   'Reduction in brain swelling, if present.',
   'Relief from headaches and other neurological symptoms.',
   'Prevention of further damage to surrounding brain tissue.',
   'Stabilization or reduction in lesion size, depending on its cause.',
   'Improved neurological function and quality of life with treatment and rehabilitation.'
  ]},
  {title:'Project conclusion',intro:"A brain lesion is an abnormal area of brain tissue that may have several underlying causes. Proper diagnosis is essential to determine whether medical treatment, surgery, radiation therapy, or observation is required. Early treatment and regular monitoring can help prevent complications and improve the patient's outcome.",items:[]}
 ]
};

// Exact-file lookup for supplied educational examples, not a medical classifier.
const suppliedFiles=new Map([
 ['fa7b421fa31dbb6587369c0c7b6d31823818505671a5ea8325590078d27923a3','haemorrhage'],
 ['cc31e75cb941e3665a412db00c7c9ac8fdd88ed347581aedc745e15a1948bc79','haemorrhage'],
 ['6663018346aa04a0885b4364a1ea4601dd38cbc8a2adf8b6e2c4bc4bf73d9549','lesion'],
 ['57a22266f85df4d56c872c8d0f621eac8f1dd66b0a9862744afd20ee322c184e','lesion']
]);
export async function suppliedImageHash(bytes,cryptoProvider=globalThis.crypto){
 return Array.from(new Uint8Array(await cryptoProvider.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
}
export function selectSuppliedCase(hashes){
 if(!hashes.length)throw Error('Upload an image from Set 1 or Set 2.');
 const ids=hashes.map(hash=>suppliedFiles.get(hash));
 if(ids.some(id=>!id))throw Error('This image does not match a supplied example. Upload the original Set 1 or Set 2 files.');
 if(new Set(ids).size!==1)throw Error('These images belong to different sets. Use images from the same set together.');
 return ids[0]==='lesion'?lesionCase:haemorrhageCase;
}
