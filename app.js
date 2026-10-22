'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const DAY=864e5,NEW_PER_DAY=25,K='htv-srs',KS='htv-settings',KL='htv-log';
let words=[],pages=[],srs=JSON.parse(localStorage.getItem(K)||'{}'),set=JSON.parse(localStorage.getItem(KS)||'{}'),log=JSON.parse(localStorage.getItem(KL)||'{}');
let queue=[],cur=null,shown=false,curDir='en';
const save=()=>{localStorage.setItem(K,JSON.stringify(srs));localStorage.setItem(KS,JSON.stringify(set));localStorage.setItem(KL,JSON.stringify(log))};
const ymd=d=>d.toLocaleDateString('sv');const today=()=>ymd(new Date());
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
let audio=new Audio();const play=w=>{audio.src=w.audio;audio.play().catch(()=>{})};
// ---- SM-2 ----
function sm2(st,q){st={ef:2.5,reps:0,int:0,lapses:0,...st};
 if(q<3){st.reps=0;st.int=0;st.lapses++;st.due=Date.now()+10*60e3}
 else{st.reps++;st.int=st.reps==1?(q==5?3:1):st.reps==2?(q==3?3:6):Math.round(st.int*st.ef*(q==3?.8:q==5?1.3:1));
  st.due=Date.now()+st.int*DAY}
 st.ef=Math.max(1.3,st.ef+0.1-(5-q)*(0.08+(5-q)*0.02));st.last=Date.now();return st}
const label=d=>d<1?'10 phút':d<30?d+' ngày':Math.round(d/30)+' tháng';
// ---- data ----
async function load(){pages=(await (await fetch('data/pages.json')).json()).pages;
 $('#fPage').innerHTML='<option value="">Tất cả các trang</option>'+pages.map(p=>`<option value="${p.id}">${esc(p.title)}</option>`).join('');
 for(const p of pages){const ws=await (await fetch(p.file)).json();ws.forEach(w=>w.page=p.id);words.push(...ws)}
 const days=[...new Set(words.flatMap(w=>w.tags.filter(t=>/^day/.test(t))))].sort();
 $('#fDay').innerHTML+=days.map(d=>`<option value="${d}">Ngày ${+d.slice(3)}</option>`).join('');
 for(const id of ['fPage','fDay','fCefr','mode','dir'])if(set[id]!=null)$('#'+id).value=set[id];$('#fTask1').checked=!!set.fTask1;
 build();}
function filtered(){const p=$('#fPage').value,d=$('#fDay').value,c=$('#fCefr').value,t=$('#fTask1').checked;
 return words.filter(w=>(!p||w.page==p)&&(!d||w.tags.includes(d))&&(!c||w.cefr.includes(c))&&(!t||w.tags.includes('ielts-task1')))}
function build(){const f=filtered(),now=Date.now();
 if($('#mode').value=='all'){queue=shuffle(f.slice())}
 else{const due=f.filter(w=>srs[w.id]&&srs[w.id].due<=now).sort((a,b)=>srs[a.id].due-srs[b.id].due);
  const lt=log[today()]||{};const left=Math.max(0,NEW_PER_DAY-(lt.new||0));
  queue=due.concat(f.filter(w=>!srs[w.id]).slice(0,left))}
 next()}
function next(){cur=queue.shift();shown=false;curDir=$('#dir').value=='mix'?(Math.random()<.5?'en':'vi'):$('#dir').value;render()}
function back(w){return `<div class="w">${esc(w.w)}</div><div class="ipa">${esc(w.ipa)}</div><button class="au" onclick="event.stopPropagation();play(cur)" aria-label="Nghe">🔊</button>
 <div><span class="tag">${esc(w.pos)}</span><span class="tag lv">${esc(w.lv)}</span>${w.tags.includes('ielts-task1')?'<span class="tag">Task 1</span>':''}</div>
 <div class="vi">${esc(w.vi)}</div><div class="sec"><div class="lab">Ví dụ</div><i>${esc(w.ex)}</i><br>${esc(w.exvi)}</div>
 <div class="sec"><div class="lab">Cụm từ / họ từ</div>${esc(w.col)}</div>${w.tip?`<div class="sec tip">💡 ${esc(w.tip)}</div>`:''}`}
function render(){const mode=$('#mode').value;
 $('#prog').textContent=cur?`Còn ${queue.length+1} thẻ • ${mode=='all'?'Học hết toàn bộ':'Ôn theo lịch'}`:'';
 if(!cur){$('#card').innerHTML=`<div class="w">🎉</div><p>Xong rồi! ${mode=='due'?'Hết thẻ cần ôn hôm nay. Chọn “Học hết toàn bộ” để học tiếp.':'Bạn đã đi hết các từ trong bộ lọc.'}</p><button class="big" onclick="build()">Học lại</button>`;
  $('#grade').classList.add('hidden');$('#flip').classList.add('hidden');return}
 $('#flip').classList.toggle('hidden',shown);$('#grade').classList.toggle('hidden',!shown);
 if(shown){$('#card').innerHTML=back(cur);const st=srs[cur.id]||{};for(const q of [0,3,4,5]){const n=sm2({...st},q);$('#i'+q).textContent=label(q<3?0:n.int)}}
 else if(curDir=='en'){$('#card').innerHTML=`<div class="w">${esc(cur.w)}</div><div class="ipa">${esc(cur.ipa)}</div><span class="tag">${esc(cur.pos)}</span><br><button class="au" onclick="event.stopPropagation();play(cur)">🔊</button><p class="muted">Chạm để lật thẻ</p>`;play(cur)}
 else $('#card').innerHTML=`<div class="vi">${esc(cur.vi)}</div><span class="tag">${esc(cur.pos)}</span><p class="muted">Từ tiếng Anh là gì? Chạm để lật</p>`}
function flip(){if(!cur||shown)return;shown=true;render();if(curDir=='vi')play(cur)}
function grade(q){const isNew=!srs[cur.id];srs[cur.id]=sm2(srs[cur.id],q);const t=today();log[t]=log[t]||{rev:0,new:0};log[t].rev++;if(isNew)log[t].new++;
 if(q<3&&$('#mode').value=='all')queue.splice(Math.min(queue.length,5),0,cur);save();next()}
// ---- quiz ----
let qz=null;
function startQuiz(){const f=filtered();if(f.length<4){$('#quiz').innerHTML='<p>Cần ít nhất 4 từ trong bộ lọc.</p>';return}
 qz={items:shuffle(f.slice()).slice(0,10),i:0,score:0,type:$('#qtype').value};showQ()}
function showQ(){const it=qz.items[qz.i];if(!it){$('#quiz').innerHTML=`<div class="card"><div class="w">${qz.score}/${qz.items.length}</div><p>${qz.score>=8?'Xuất sắc! 🎉':qz.score>=5?'Khá tốt, cố thêm nhé!':'Ôn lại các từ này nhé 💪'}</p></div>`;return}
 const head=`<p class="muted">Câu ${qz.i+1}/${qz.items.length} • Điểm ${qz.score}</p>`;
 if(qz.type=='mc'){const en=Math.random()<.5;const opts=shuffle([it,...shuffle(words.filter(w=>w.id!=it.id)).slice(0,3)]);
  $('#quiz').innerHTML=head+`<div class="card" style="min-height:auto"><div class="${en?'w':'vi'}">${esc(en?it.w:it.vi)}</div></div>`+opts.map(o=>`<button class="opt" data-id="${o.id}">${esc(en?o.vi:o.w)}</button>`).join('');
  $$('.opt').forEach(b=>b.onclick=()=>{const ok=b.dataset.id==it.id;b.classList.add(ok?'ok':'bad');$$('.opt').forEach(x=>{x.disabled=true;if(x.dataset.id==it.id)x.classList.add('ok')});ans(it,ok)})}
 else{$('#quiz').innerHTML=head+`<div class="card" style="min-height:auto"><div class="vi">${esc(it.vi)}</div><span class="tag">${esc(it.pos)}</span></div><input id="ty" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Gõ từ tiếng Anh…"><button class="big" id="tyok">Kiểm tra</button>`;
  const go=()=>{const v=$('#ty').value.trim().toLowerCase(),alts=it.w.toLowerCase().replace(/\s*\(.*?\)/,'').split(/,\s*/);const ok=alts.includes(v);
   $('#ty').classList.add(ok?'ok':'bad');$('#ty').disabled=true;$('#tyok').outerHTML=`<p>${ok?'✅ Đúng!':'❌ Đáp án: <b>'+esc(it.w)+'</b>'}</p>`;ans(it,ok)};
  $('#tyok').onclick=go;$('#ty').onkeydown=e=>{if(e.key=='Enter')go()};$('#ty').focus()}}
function ans(it,ok){if(ok)qz.score++;const s=srs[it.id]=srs[it.id]||{};s.qok=(s.qok||0)+(ok?1:0);s.qbad=(s.qbad||0)+(ok?0:1);save();play(it);
 $('#quiz').insertAdjacentHTML('beforeend','<button class="big" id="qn">Tiếp →</button>');$('#qn').onclick=()=>{qz.i++;showQ()}}
// ---- list & stats ----
function renderList(){const q=$('#search').value.toLowerCase();
 $('#list').innerHTML=filtered().filter(w=>!q||w.w.toLowerCase().includes(q)||w.vi.toLowerCase().includes(q)).map(w=>`<div class="it"><div><b>${esc(w.w)}</b> <span class="muted">${esc(w.ipa)}</span><br>${esc(w.vi)} <span class="tag lv">${esc(w.lv)}</span></div><button class="au" data-id="${w.id}">🔊</button></div>`).join('');
 $$('#list .au').forEach(b=>b.onclick=()=>play(words.find(w=>w.id==b.dataset.id)))}
function renderStats(){const f=filtered(),now=Date.now();const learned=f.filter(w=>srs[w.id]&&srs[w.id].reps),mature=f.filter(w=>srs[w.id]&&srs[w.id].int>=21),due=f.filter(w=>srs[w.id]&&srs[w.id].due<=now);
 const days=Object.keys(log).sort().slice(-7);let streak=0;for(let d=new Date();log[ymd(d)];d=new Date(d-DAY))streak++;
 const pct=n=>f.length?Math.round(n/f.length*100):0;
 const byLv=['A1','A2','B1','B2'].map(l=>{const a=f.filter(w=>w.cefr.includes(l));const b=a.filter(w=>srs[w.id]&&srs[w.id].reps).length;return `<div>${l}: ${b}/${a.length}<div class="bar"><i style="width:${a.length?b/a.length*100:0}%"></i></div></div>`}).join('');
 $('#stats').innerHTML=`<div class="stat"><b>Đã học:</b> ${learned.length}/${f.length} (${pct(learned.length)}%)<div class="bar"><i style="width:${pct(learned.length)}%"></i></div></div>
 <div class="stat">🔥 Chuỗi ngày học: <b>${streak}</b><br>⏰ Cần ôn bây giờ: <b>${due.length}</b><br>🌳 Nhớ lâu (≥21 ngày): <b>${mature.length}</b></div>
 <div class="stat"><b>Theo cấp độ</b>${byLv}</div><div class="stat"><b>7 ngày gần nhất</b><br>${days.map(d=>`${d}: ${log[d].rev} lượt (${log[d].new} từ mới)`).join('<br>')||'Chưa có'}</div>`}
// ---- events ----
function show(v){$$('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.v==v));$$('.view').forEach(x=>x.classList.add('hidden'));$('#v-'+v).classList.remove('hidden');if(v=='list')renderList();if(v=='stats')renderStats()}
$$('#tabs button').forEach(b=>b.onclick=()=>show(b.dataset.v));
$('#card').onclick=flip;$('#flip').onclick=flip;$$('#grade button').forEach(b=>b.onclick=()=>grade(+b.dataset.q));
for(const id of ['fPage','fDay','fCefr','fTask1','mode','dir'])$('#'+id).onchange=()=>{set[id]=id=='fTask1'?$('#fTask1').checked:$('#'+id).value;save();build();if(!$('#v-list').classList.contains('hidden'))renderList();if(!$('#v-stats').classList.contains('hidden'))renderStats()};
$('#qstart').onclick=startQuiz;$('#search').oninput=renderList;
$('#reset').onclick=()=>{if(confirm('Xoá toàn bộ tiến độ học?')){srs={};log={};save();build();renderStats()}};
const applyTheme=()=>{document.body.classList.toggle('dark',!!set.dark);$('#theme').textContent=set.dark?'☀️':'🌙'};
if(set.dark==null)set.dark=matchMedia('(prefers-color-scheme: dark)').matches;applyTheme();$('#theme').onclick=()=>{set.dark=!set.dark;save();applyTheme()};
document.addEventListener('keydown',e=>{if($('#v-study').classList.contains('hidden'))return;if(e.key==' ')flip();if(shown&&'1234'.includes(e.key))grade([0,3,4,5][e.key-1])});
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
load();
