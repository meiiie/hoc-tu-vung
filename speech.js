'use strict';
/* Recording, on-device scoring engine bridge, playback and voice visualisation for "Luyện nói" (v8). */
const Speech=(()=>{
 let worker=null,seq=0;const pend=new Map();let progCb=null,statusCb=null;
 function W(){if(worker)return worker;worker=new Worker('asr-worker.js');worker.onmessage=e=>{const m=e.data;
  if(m.type=='progress'){progCb&&progCb(m);return}
  if(m.type=='status'){statusCb&&statusCb(m);statusCb=null;return}
  if(m.type=='ready'){const p=pend.get('load');p&&p.ok();pend.delete('load');return}
  const p=pend.get(m.id!=null?m.id:'load');if(!p)return;pend.delete(m.id!=null?m.id:'load');m.type=='error'?p.no(new Error(m.msg)):p.ok(m.res)};
  worker.onerror=e=>{for(const [,p] of pend)p.no(new Error('worker'));pend.clear()};return worker}
 const supported=()=>typeof Worker!='undefined'&&typeof WebAssembly=='object'&&'caches' in self&&!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia);
 const status=()=>new Promise(ok=>{if(!supported())return ok({cached:false,ready:false});statusCb=ok;W().postMessage({type:'status'});setTimeout(()=>ok({cached:false,ready:false}),4000)});
 const load=onProg=>new Promise((ok,no)=>{progCb=onProg;pend.set('load',{ok,no});W().postMessage({type:'load'})});
 const analyze=(pcm,variants,uk)=>new Promise((ok,no)=>{const id=++seq;pend.set(id,{ok,no});W().postMessage({type:'run',id,pcm,variants,uk},[pcm.buffer])});
 const forget=()=>new Promise(ok=>{statusCb=ok;W().postMessage({type:'forget'})});
 /* ---------- recording with simple voice-activity detection ---------- */
 let AC=null;const ctx=()=>{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();return AC};
 async function record({onLevel,maxMs=5000,silenceMs=900}={}){const ac=ctx();if(ac.state=='suspended')await ac.resume();
  const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1}});
  const src=ac.createMediaStreamSource(stream),proc=ac.createScriptProcessor(2048,1,1),chunks=[];let speech=false,lastLoud=0,t0=performance.now(),noise=0.004,stopped=false,resolve;
  const done=new Promise(r=>resolve=r);
  const stop=(why='manual')=>{if(stopped)return;stopped=true;try{proc.disconnect();src.disconnect()}catch(e){}stream.getTracks().forEach(t=>t.stop());
   const n=chunks.reduce((a,c)=>a+c.length,0),pcm=new Float32Array(n);let o=0;for(const c of chunks){pcm.set(c,o);o+=c.length}resolve({pcm,sr:ac.sampleRate,speech,why})};
  proc.onaudioprocess=e=>{if(stopped)return;const x=e.inputBuffer.getChannelData(0);chunks.push(new Float32Array(x));let s=0;for(let i=0;i<x.length;i++)s+=x[i]*x[i];const rms=Math.sqrt(s/x.length),now=performance.now();
   if(now-t0<250)noise=Math.max(noise,rms*1.5);const thr=Math.max(0.012,noise*2.2);if(rms>thr){speech=true;lastLoud=now}
   onLevel&&onLevel(Math.min(1,rms*12));if(now-t0>maxMs)stop('max');else if(speech&&now-lastLoud>silenceMs)stop('silence');else if(!speech&&now-t0>4000)stop('nospeech')};
  src.connect(proc);proc.connect(ac.destination);return {stop,done}}
 /* resample to 16 kHz (box filter + linear interpolation) and trim leading/trailing silence */
 function to16k(pcm,sr){const r=sr/16000,n=Math.floor(pcm.length/r),out=new Float32Array(n),w=Math.max(1,Math.round(r));
  for(let i=0;i<n;i++){const c=i*r,a=Math.floor(c);let s=0,k=0;for(let j=a-(w>>1);j<=a+(w>>1);j++)if(j>=0&&j<pcm.length){s+=pcm[j];k++}out[i]=k?s/k:0}return out}
 function trim(x){const f=320,E=[];for(let i=0;i+f<=x.length;i+=f){let s=0;for(let j=i;j<i+f;j++)s+=x[j]*x[j];E.push(Math.sqrt(s/f))}
  const mx=Math.max(...E,1e-6),thr=Math.max(0.008,mx*0.08);let a=E.findIndex(e=>e>thr),b=E.length-1-[...E].reverse().findIndex(e=>e>thr);if(a<0)return x;
  a=Math.max(0,(a-8)*f);b=Math.min(x.length,(b+10)*f);return x.slice(a,b)}
 function peak(x){let m=0;for(let i=0;i<x.length;i++)m=Math.max(m,Math.abs(x[i]));return m}
 function wav(x,sr=16000){const b=new ArrayBuffer(44+x.length*2),v=new DataView(b),w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};
  w(0,'RIFF');v.setUint32(4,36+x.length*2,true);w(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,x.length*2,true);
  const g=0.9/Math.max(0.05,peak(x));for(let i=0;i<x.length;i++)v.setInt16(44+i*2,Math.max(-1,Math.min(1,x[i]*g))*32767,true);return new Blob([b],{type:'audio/wav'})}
 async function decodeUrl(url){const ac=ctx();const r=await fetch(url);const ab=await r.arrayBuffer();const buf=await new Promise((ok,no)=>ac.decodeAudioData(ab,ok,no));return trim(to16k(buf.getChannelData(0),buf.sampleRate))}
 /* pitch by normalised autocorrelation, 20 ms hop, 75-400 Hz; null where unvoiced */
 function pitch(x){const hop=320,win=640,out=[];for(let s=0;s+win<=x.length;s+=hop){let e=0;for(let i=0;i<win;i++)e+=x[s+i]*x[s+i];if(e/win<2e-5){out.push(null);continue}
  let best=0,bl=0;for(let l=40;l<=213;l++){let c=0,e1=0,e2=0;for(let i=0;i<win-l;i++){c+=x[s+i]*x[s+i+l];e1+=x[s+i]*x[s+i];e2+=x[s+i+l]*x[s+i+l]}const r=c/Math.sqrt(e1*e2+1e-9);if(r>best){best=r;bl=l}}
  out.push(best>0.55?16000/bl:null)}return out}
 function envelope(x,n){const out=new Float32Array(n),f=Math.max(1,Math.floor(x.length/n));for(let i=0;i<n;i++){let m=0;for(let j=i*f;j<Math.min(x.length,(i+1)*f);j++)m=Math.max(m,Math.abs(x[j]));out[i]=m}const p=Math.max(...out,1e-6);return out.map(v=>v/p)}
 return {supported,status,load,analyze,forget,record,to16k,trim,wav,decodeUrl,pitch,envelope,peak,ctx}})();
