// Exact local file identity selects a user-supplied presentation fixture.
// No scan interpretation is performed; the reference image is not bundled.
export const demoHash='0459c9fa4c28c06521fb0a9e2ef76342e1a82f8c7575da8971cfe43933bf9190';
export async function isDemoImage(file){
 const bytes=await file.arrayBuffer();
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
 return hash===demoHash;
}
export const demoMarkup=`<div class="summary"><strong>Demo case — predefined result</strong><br>User-supplied presentation content. Counts and visual descriptions below are unverified demo observations, not findings detected or confirmed by this app.</div>
<article class="finding demo-finding"><h3>Kidney Stone CT Scan <small>Findings &amp; treatment options</small></h3><div class="body"><span class="status">Prepared demonstration · not a diagnosis</span>
<p><strong>User-supplied demo description:</strong> Multiple stone-like spots appear in both kidneys. This description and the counts below have not been clinically verified; the screenshot alone cannot establish stones, measurements, or precise locations.</p>
<div class="section-caption">FINDINGS AT A GLANCE</div><div class="kidney-grid"><section class="kidney-card"><h4>Right Kidney</h4><div class="finding-count">~3 <span>stone-like spots</span></div><ul><li>Approximately 3 prominent stone-like spots (user-supplied demo observation).</li><li>Exact size and location cannot be confirmed from the screenshot alone.</li></ul></section>
<section class="kidney-card"><h4>Left Kidney</h4><div class="finding-count">~3 <span>stone-like spots</span></div><ul><li>Approximately 3 prominent stone-like spots (user-supplied demo observation).</li><li>Some appear clustered together, according to the supplied demo description.</li><li>Exact size and location cannot be confirmed.</li></ul></section></div>
<h4 class="section-title">Possible Treatment Options</h4><p>General educational overview, not a treatment-selection rule. No size category has been assigned to this image. Location, symptoms, obstruction, infection, stone composition, anatomy, and total stone burden also matter.</p><ul class="size-options">
<li><strong>Below 5 mm:</strong> Monitoring, appropriate fluids and symptom control may be considered in selected cases. Some small ureter stones may pass; kidney stones may remain in place.</li>
<li><strong>5–10 mm:</strong> Selected patients may be offered monitoring, medicines, ESWL or an endoscopic procedure, depending on clinical assessment and location.</li>
<li><strong>10–20 mm:</strong> ESWL or URS/RIRS may be considered. Lower-pole location and other factors can change the choice.</li>
<li><strong>Above 20 mm:</strong> PCNL is commonly considered for renal stones; the complete case needs specialist assessment.</li></ul>
<h4 class="section-title">Solutions / Treatment Options</h4><ol class="treatment-options">
<li><strong>Medication &amp; Monitoring:</strong> A doctor may recommend pain relief, follow-up and suitable fluid intake for selected cases. Natural passage depends on location and other factors.</li>
<li><strong>Medical Expulsive Therapy:</strong> A doctor may consider medicines such as tamsulosin for selected distal ureter stones, particularly 5–10 mm. This is an off-label use and does not apply automatically to stones remaining in the kidney.</li>
<li><strong>ESWL (Shock Wave Lithotripsy):</strong> External shock waves fragment selected stones so fragments can pass in urine.</li>
<li><strong>Laser Treatment (URS/RIRS):</strong> A scope passed through the urinary tract can fragment stones with a laser. A temporary stent may be needed.</li>
<li><strong>PCNL Surgery:</strong> A small incision through the back provides access for removal of large or complex kidney stones.</li>
<li><strong>Preventing Future Stones:</strong> Discuss suitable fluid intake and reducing excess salt. Tailor dietary changes to stone analysis and medical advice, with appropriate follow-up imaging and urine tests.</li></ol>
<p class="muted">No single “right option” can be selected from this screenshot. A radiologist’s report and clinical assessment are needed.</p>
<a href="https://www.niddk.nih.gov/health-information/urologic-diseases/kidney-stones/treatment" target="_blank" rel="noopener noreferrer">NIDDK · Kidney stone treatment</a><br><a href="https://uroweb.org/guidelines/urolithiasis/chapter/guidelines" target="_blank" rel="noopener noreferrer">EAU · Urolithiasis guidelines</a><p class="muted">Sources checked 22 November 2026 · demo content not clinician validated.</p></div></article>`;
