let libraryPromise;
function loadLibrary(){
 if(globalThis.Tesseract)return Promise.resolve(globalThis.Tesseract);
 if(!libraryPromise)libraryPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.min.js';script.crossOrigin='anonymous';
  const timer=setTimeout(()=>{script.remove();reject(Error('OCR engine download timed out. Check your connection and try again.'));},45000);
  script.onload=()=>{clearTimeout(timer);globalThis.Tesseract?resolve(globalThis.Tesseract):reject(Error('OCR engine unavailable.'));};
  script.onerror=()=>{clearTimeout(timer);script.remove();reject(Error('Could not download the OCR engine. Check your connection or paste report text instead.'));};document.head.append(script);
 }).catch(e=>{libraryPromise=undefined;throw e;});
 return libraryPromise;
}
export async function recognizeImage(file,{signal,onProgress}){
 let worker;const abort=()=>{if(worker)void worker.terminate().catch(()=>{});};
 signal.addEventListener('abort',abort,{once:true});
 try{
  const engine=await loadLibrary();signal.throwIfAborted();
  worker=await engine.createWorker('eng',1,{logger:m=>{if(!signal.aborted)onProgress(m.status,m.progress??0);}});
  signal.throwIfAborted();
  const result=await worker.recognize(file);signal.throwIfAborted();return result.data.text.trim();
 }finally{signal.removeEventListener('abort',abort);if(worker)await worker.terminate().catch(()=>{});}
}
