import test from 'node:test';
import assert from 'node:assert/strict';
test('image waits for Analyse, renders options, and reuses corrected text',async()=>{
 const elements=new Map();
 const element=id=>{if(!elements.has(id))elements.set(id,{value:'',textContent:'',innerHTML:'',innerText:'',hidden:false,files:[],addEventListener(name,handler){this[name]=handler;},removeAttribute(name){delete this[name];}});return elements.get(id);};
 globalThis.document={getElementById:element,querySelectorAll:()=>[]};
 let calls=0;
 globalThis.Tesseract={createWorker:async()=>({recognize:async()=>{calls++;return {data:{text:'Ultrasound abdomen. Impression: Mild fatty liver.'}};},terminate:async()=>{}})};
 await import('../dist/app.js');
 const file=new Blob(['synthetic image'],{type:'image/png'});file.name='synthetic.png';element('file').files=[file];
 await element('file').onchange();
 assert.equal(calls,0);assert.match(element('ocr-status').textContent,/Image ready/);
 await element('analyze').onclick();
 assert.equal(calls,1);assert.match(element('results').innerHTML,/Problem mentioned: Fat accumulation/);assert.match(element('results').innerHTML,/Possible solutions \/ care options/);assert.equal(element('analyze').disabled,false);
 element('report').value='No renal calculus is identified.';element('report').input();
 await element('analyze').onclick();
 assert.equal(calls,1);assert.match(element('results').innerHTML,/No care options are assigned/);
 element('clear').onclick();assert.equal(element('report').value,'');assert.equal(element('download').hidden,true);assert.equal(element('image-panel').hidden,true);
});
