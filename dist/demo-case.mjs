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
<h4>Fictional case details — not measured from this image</h4><ul>
<li><strong>Stone size:</strong> 5 mm (assumed for the demo).</li>
<li><strong>Location:</strong> Right kidney, lower calyx (assumed).</li>
<li><strong>Clinical scenario:</strong> Adult, no symptoms, no obstruction or infection, normal kidney function, and no additional high-risk features (all assumed).</li>
</ul>
<div class="summary"><strong>Example initial pathway: clinician-supervised active surveillance</strong><p>If all fictional details are confirmed, a clinician may consider monitoring with follow-up imaging rather than immediate removal. This is a conditional educational example, not the “correct treatment” for the uploaded picture. Monitoring does not guarantee stone passage or cure.</p></div>
<h4>Possible solutions / care options</h4><ul>
<li><strong>Monitoring:</strong> An option to discuss for the fictional small, asymptomatic calyceal stone; follow-up is individualized.</li>
<li><strong>Medicines:</strong> A clinician may prescribe pain control or stone-specific treatment. Tablets do not dissolve every stone.</li>
<li><strong>Shock wave lithotripsy:</strong> External shock waves break selected stones into smaller pieces.</li>
<li><strong>Ureteroscopy:</strong> A scope is used to remove or fragment selected stones.</li>
<li><strong>Percutaneous nephrolithotomy:</strong> A procedure through a small back incision may be considered for larger stones.</li>
</ul>
<h4>When the pathway changes</h4><p>Growth, pain, infection, obstruction, kidney-function concerns, or patient preferences can change management. A clinician must confirm the case details and select care.</p>
<h4>Who can help</h4><p>A treating doctor or urologist.</p>
<a href="https://www.niddk.nih.gov/health-information/urologic-diseases/kidney-stones/treatment" target="_blank" rel="noopener noreferrer">NIDDK · Kidney stone treatment</a><br><a href="https://uroweb.org/guidelines/urolithiasis/chapter/guidelines" target="_blank" rel="noopener noreferrer">EAU · Renal stone observation and treatment guidance</a><p class="muted">Sources checked 22 November 2026 · prepared demonstration, not clinician validated.</p></div></article>`;
