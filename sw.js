const V='htv-v4',AUDIO='htv-audio-v1';
const SHELL=['./','index.html','style.css','app.js','mascot.js','manifest.webmanifest','data/pages.json','data/p1.json','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x!==AUDIO).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;const u=new URL(r.url);if(r.method!=='GET'||u.origin!==location.origin)return;
 if(u.pathname.includes('/audio/')){ // audio: cache lazily on first play (cache-first)
  e.respondWith(caches.open(AUDIO).then(c=>c.match(u.pathname,{ignoreSearch:true}).then(m=>m||fetch(r.url).then(res=>{if(res.status===200)c.put(u.pathname,res.clone());return res}))));return}
 // app shell & data: network-first, fall back to cache when offline
 e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./'))))});
