const V='htv-v17',AUDIO='htv-audio-v1',ENGINE='htv-engine-v1';
const SHELL=['./','index.html','style.css','app.js','srs.js','vendor/ts-fsrs.min.js','mascot.js','pron.js','artic.js','speech.js','asr-worker.js','data/pron.json','data/pron-uk.json','vendor/zipa-tokens.txt','manifest.webmanifest','data/pages.json','data/p1.json','icons/icon-192.png','icons/icon-512.png','icons/icon.svg','icons/maskable-192.png','icons/maskable-512.png','icons/apple-touch-icon.png'];
/* Install precaches the shell but WAITS: the page shows "Có bản mới — Tải lại" and posts 'skip' when the user agrees.
   Progress lives in localStorage, which a service worker update never touches. */
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})))))});
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x!==AUDIO&&x!==ENGINE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
/* Serve Range requests from a full cached response (Safari/iOS asks for bytes=0-1 first). */
async function ranged(req,res){const h=req.headers.get('range');if(!h)return res;const buf=await res.arrayBuffer(),size=buf.byteLength;const m=/bytes=(\d*)-(\d*)/.exec(h);if(!m)return new Response(buf,{status:200,headers:res.headers});
 let a=m[1]?+m[1]:0,b=m[2]?+m[2]:size-1;if(!m[1]&&m[2]){a=size-+m[2];b=size-1}if(a>=size||a>b)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});b=Math.min(b,size-1);
 return new Response(buf.slice(a,b+1),{status:206,headers:{'Content-Type':res.headers.get('Content-Type')||'audio/mpeg','Content-Range':`bytes ${a}-${b}/${size}`,'Content-Length':String(b-a+1),'Accept-Ranges':'bytes'}})}
const timeout=(p,ms)=>new Promise((ok,no)=>{const t=setTimeout(()=>no(new Error('timeout')),ms);p.then(r=>{clearTimeout(t);ok(r)},e=>{clearTimeout(t);no(e)})});
self.addEventListener('fetch',e=>{const r=e.request;const u=new URL(r.url);if(r.method!=='GET'||u.origin!==location.origin)return;
 if(u.pathname.includes('/audio/')){ // cache-first; store only full 200 responses; answer Range from cache
  e.respondWith((async()=>{const c=await caches.open(AUDIO);const key=u.origin+u.pathname;let m=await c.match(key);if(m)return ranged(r,m);
   try{const full=await fetch(key);if(full.status===200){await c.put(key,full.clone());return ranged(r,full)}return full}catch(err){return new Response(null,{status:504})}})());return}
 if(u.pathname.includes('/vendor/ort/')){ // speech runtime (14 MB): cache-first, kept across app versions
  e.respondWith(caches.open(ENGINE).then(async c=>{const m=await c.match(r.url);if(m)return m;const res=await fetch(r.url);if(res.ok)await c.put(r.url,res.clone());return res}));return}
 // app shell & data: network-first (4s budget on slow networks), fall back to cache offline
 e.respondWith(timeout(fetch(r.url,{cache:'no-cache',credentials:'same-origin'}),4000).then(res=>{if(res.ok){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res})
  .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match('./'):Response.error()))))});
