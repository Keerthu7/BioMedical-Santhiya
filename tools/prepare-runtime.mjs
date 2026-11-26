import fs from 'node:fs';
import path from 'node:path';
const from=path.resolve('node_modules/onnxruntime-web/dist'),to=path.resolve('dist/runtime');
if(!fs.existsSync(from))throw Error('Run npm install first.');
fs.mkdirSync(to,{recursive:true});
for(const file of ['ort.wasm.min.mjs','ort-wasm-simd-threaded.mjs','ort-wasm-simd-threaded.wasm'])fs.copyFileSync(path.join(from,file),path.join(to,file));
fs.copyFileSync('tools/ONNX-Runtime-LICENSE',path.join(to,'ONNX-Runtime-LICENSE'));
console.log('Prepared same-origin CPU ONNX Runtime browser assets.');
