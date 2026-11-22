// Local file identity selects an illustrative fixture, never a diagnosis.
// The reference image is not bundled or transmitted.
export const demoHash='0459c9fa4c28c06521fb0a9e2ef76342e1a82f8c7575da8971cfe43933bf9190';
export async function isDemoImage(file){
 const bytes=await file.arrayBuffer();
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
 return hash===demoHash;
}
export const demoMarkup=`<div class="summary"><strong>Demo case — predefined result</strong><br>Prepared kidney-stone scenario for demonstrating the workflow. This is not a diagnosis or an analysis of the uploaded scan.</div>
<article class="finding"><h3>Problem: Kidney stones (illustrative case)</h3><div class="body"><span class="status">Educational demonstration · not patient-specific</span>
<h4>What it means</h4><p>Kidney stones are solid deposits in the urinary system. This scenario assumes stones for demonstration; their presence, number, size, location, and obstruction are not established from this image.</p>
<h4>Possible solutions / care options</h4><ul>
<li><strong>Observation:</strong> Some small stones may pass. A clinician may advise fluids when appropriate and follow-up.</li>
<li><strong>Medicines:</strong> A clinician may prescribe pain control or stone-specific treatment. Tablets do not dissolve every stone.</li>
<li><strong>Shock wave lithotripsy:</strong> External shock waves break selected stones into smaller pieces.</li>
<li><strong>Ureteroscopy:</strong> A scope is used to remove or fragment selected stones.</li>
<li><strong>Percutaneous nephrolithotomy:</strong> A procedure through a small back incision may be considered for larger stones.</li>
</ul>
<h4>How the right option is chosen</h4><p>Choice depends on stone size, location, type, symptoms, obstruction, infection assessment, kidney function, and clinical evaluation. No option is selected for this image.</p>
<h4>Who can help</h4><p>A treating doctor or urologist.</p>
<a href="https://www.niddk.nih.gov/health-information/urologic-diseases/kidney-stones/treatment" target="_blank" rel="noopener noreferrer">NIDDK · Kidney stone treatment</a><p class="muted">Source checked 22 November 2026 · prepared demonstration, not clinician validated.</p></div></article>`;
