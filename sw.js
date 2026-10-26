const V='htv-v24',AUDIO='htv-audio-v1',ENGINE='htv-engine-v1';
const SHELL=['./','index.html','style.css','app.js','content.js','learning-plan.js','data/study-order.json','storage.js','srs.js','vendor/ts-fsrs.min.js','mascot.js','pron.js','artic.js','speech.js','asr-worker.js','data/pron.json','data/pron-uk.json','data/pron-sources.json','vendor/zipa-tokens.txt','manifest.webmanifest','data/pages.json','CONTENT_SOURCES.html','docs/audits/oxford-counts-2026-10-26.json','content/licenses/wordfreq-README.md','icons/icon-192.png','icons/icon-512.png','icons/icon.svg','icons/maskable-192.png','icons/maskable-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(V);
 try{await cache.addAll(SHELL.map(url=>new Request(url,{cache:'reload'})));
  const index=await (await cache.match('data/pages.json')).json();
  await cache.addAll(index.pages.map(page=>new Request(page.file,{cache:'reload'})));
 }catch(error){await caches.delete(V);throw error}
})()));
self.addEventListener('message',event=>{if(event.data==='skip')self.skipWaiting()});
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(key=>/^htv-v\d+$/.test(key)&&key!==V).map(key=>caches.delete(key)));
 await self.clients.claim();
})()));
async function ranged(request,response){
 const range=request.headers.get('range');if(!range)return response;
 const data=await response.arrayBuffer(),size=data.byteLength,match=/^bytes=(\d*)-(\d*)$/.exec(range);
 if(!match||(!match[1]&&!match[2]))return new Response(data,{status:200,headers:response.headers});
 let start=match[1]?+match[1]:Math.max(0,size-(+match[2]));
 let end=match[1]&&match[2]?+match[2]:size-1;
 if(start>=size||start>end||(!match[1]&&+match[2]===0))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
 end=Math.min(end,size-1);
 return new Response(data.slice(start,end+1),{status:206,headers:{'Content-Type':response.headers.get('Content-Type')||'audio/mpeg','Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':String(end-start+1),'Accept-Ranges':'bytes'}});
}
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==location.origin)return;
 if(url.pathname.includes('/audio/')){
  event.respondWith((async()=>{
   const cache=await caches.open(AUDIO),key=url.origin+url.pathname,cached=await cache.match(key);
   if(cached)return ranged(request,cached);
   try{const response=await fetch(key);if(response.status===200){try{await cache.put(key,response.clone())}catch(error){}return ranged(request,response)}return response}
   catch(error){return new Response(null,{status:504})}
  })());return;
 }
 if(url.pathname.includes('/vendor/ort/')){
  event.respondWith((async()=>{
   const cache=await caches.open(ENGINE),cached=await cache.match(request.url);if(cached)return cached;
   const response=await fetch(request);if(response.ok)try{await cache.put(request.url,response.clone())}catch(error){}return response;
  })());return;
 }
 // Serve the active worker's complete snapshot until the next snapshot has finished installing.
 event.respondWith((async()=>{
  const cache=await caches.open(V),cached=await cache.match(request,{ignoreSearch:true});if(cached)return cached;
  try{return await fetch(request)}catch(error){return request.mode==='navigate'?(await cache.match('./'))||Response.error():Response.error()}
 })());
});
