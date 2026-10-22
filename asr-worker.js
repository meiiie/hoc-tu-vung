'use strict';
/* On-device phone recogniser (ZIPA-CR-Ns small, int8 ONNX, ~71 MB) running in a worker with onnxruntime-web (WASM, 1 thread).
   The model and runtime are cached in Cache Storage ("htv-engine-v1") so it works offline after the first download. */
importScripts('vendor/ort/ort.wasm.min.js','pron.js');
const MODEL='https://huggingface.co/anyspeech/zipa-small-crctc-ns-700k/resolve/797523ffb49e31e821a972313813cc4a26d902ef/model.int8.onnx';
const CACHE='htv-engine-v1';let sess=null,loading=null,tok=null;
ort.env.wasm.numThreads=1;ort.env.wasm.wasmPaths=new URL('vendor/ort/',self.location).href;
async function cached(url,onProg){const c=await caches.open(CACHE);let r=await c.match(url);if(r)return new Uint8Array(await r.arrayBuffer());
 r=await fetch(url,{mode:'cors'});if(!r.ok)throw new Error('http '+r.status);const total=+r.headers.get('content-length')||71e6,rd=r.body.getReader(),parts=[];let got=0,last=0;
 for(;;){const {done,value}=await rd.read();if(done)break;parts.push(value);got+=value.length;if(got-last>5e5){last=got;onProg&&onProg(got,total)}}
 const buf=new Uint8Array(got);let o=0;for(const p of parts){buf.set(p,o);o+=p.length}
 try{await c.put(url,new Response(buf,{headers:{'Content-Type':'application/octet-stream'}}))}catch(e){/* quota: still usable this session */}return buf}
async function load(){if(sess)return;if(loading)return loading;
 loading=(async()=>{const t=await (await fetch('vendor/zipa-tokens.txt')).text();tok=[];t.split('\n').forEach(l=>{const m=l.match(/^(.*) (\d+)$/);if(m)tok[+m[2]]=m[1]});
  const buf=await cached(MODEL,(g,t)=>postMessage({type:'progress',got:g,total:t}));postMessage({type:'progress',got:1,total:1,phase:'init'});
  sess=await ort.InferenceSession.create(buf,{executionProviders:['wasm'],graphOptimizationLevel:'all'})})();
 try{await loading}catch(e){loading=null;throw e}}
onmessage=async e=>{const m=e.data;try{
 if(m.type=='status'){const c=await caches.open(CACHE);postMessage({type:'status',cached:!!(await c.match(MODEL)),ready:!!sess});return}
 if(m.type=='load'){await load();postMessage({type:'ready'});return}
 if(m.type=='forget'){sess=null;loading=null;await caches.delete(CACHE);postMessage({type:'status',cached:false,ready:false});return}
 if(m.type=='run'){await load();const t0=performance.now(),F=PR.fbank(m.pcm);
  const r=await sess.run({x:new ort.Tensor('float32',F.data,[1,F.T,80]),x_lens:new ort.Tensor('int64',BigInt64Array.from([BigInt(F.T)]),[1])});
  const lp=r.log_probs,T=lp.dims[1],V=lp.dims[2],res=PR.score(lp.data,T,V,tok,m.variants,{uk:m.uk});
  res.frameSec=m.pcm.length/16000/T;res.ms=Math.round(performance.now()-t0);postMessage({type:'result',id:m.id,res})}
}catch(err){postMessage({type:'error',id:m.id,msg:String(err&&err.message||err)})}};
