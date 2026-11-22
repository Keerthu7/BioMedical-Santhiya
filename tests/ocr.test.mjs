import test from 'node:test';
import assert from 'node:assert/strict';
import {recognizeImage} from '../dist/ocr.js';
test('extracts text and terminates the OCR worker',async()=>{
 let stopped=0;const file={name:'report.png'};
 globalThis.Tesseract={createWorker:async()=>({recognize:async image=>{assert.equal(image,file);return {data:{text:'  Sample report text  '}};},terminate:async()=>{stopped++;}})};
 const text=await recognizeImage(file,{signal:new AbortController().signal,onProgress:()=>{}});
 assert.equal(text,'Sample report text');assert.equal(stopped,1);
});
test('abstains after cancellation during worker initialization',async()=>{
 const controller=new AbortController();let recognized=false,stopped=0;
 globalThis.Tesseract={createWorker:async()=>{controller.abort();return {recognize:async()=>{recognized=true;},terminate:async()=>{stopped++;}};}};
 await assert.rejects(recognizeImage({},{signal:controller.signal,onProgress:()=>{}}),{name:'AbortError'});
 assert.equal(recognized,false);assert.equal(stopped,1);
});
test('terminates the worker when recognition fails',async()=>{
 let stopped=0;
 globalThis.Tesseract={createWorker:async()=>({recognize:async()=>{throw Error('invalid image');},terminate:async()=>{stopped++;}})};
 await assert.rejects(recognizeImage({},{signal:new AbortController().signal,onProgress:()=>{}}),/invalid image/);
 assert.equal(stopped,1);
});
