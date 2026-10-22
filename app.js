'use strict';
/* Học Từ Vựng – Oxford 3000. Static PWA, no backend. Progress stays in this device's localStorage. */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const DAY=864e5,KEY='htv2';
const newPerDay=()=>S.user&&S.user.goal=='all'?1e9:+((S.user&&S.user.goal)||25);
const uname=()=>S.user&&S.user.name?S.user.name:'bạn';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const ymd=d=>d.toLocaleDateString('sv');const today=()=>ymd(new Date());
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const buzz=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};

/* ---------- state ---------- */
let S=JSON.parse(localStorage.getItem(KEY)||'null')||{srs:{},known:{},star:{},learn:{},log:{},best:{},set:{autoplay:true,dir:'en',f:{}}};
if(!localStorage.getItem(KEY)&&localStorage.getItem('htv-srs')){try{S.srs=JSON.parse(localStorage.getItem('htv-srs'))||{};S.log=JSON.parse(localStorage.getItem('htv-log')||'{}')}catch(e){}}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast('Không lưu được tiến độ')}};
const logIt=(isNew)=>{const t=today();const l=S.log[t]=S.log[t]||{rev:0,new:0};l.rev++;if(isNew)l.new++};

/* ---------- SM-2 ---------- */
function sm2(st,q){st={ef:2.5,reps:0,int:0,lapses:0,...(st||{})};
 if(q<3){st.reps=0;st.int=0;st.lapses++;st.due=Date.now()+10*60e3}
 else{st.reps++;st.int=st.reps==1?(q==5?3:1):st.reps==2?(q==3?3:6):Math.max(1,Math.round(st.int*st.ef*(q==3?.8:q==5?1.3:1)));st.due=Date.now()+st.int*DAY}
 st.ef=Math.max(1.3,st.ef+0.1-(5-q)*(0.08+(5-q)*0.02));st.last=Date.now();return st}
function grade(w,q){const isNew=!S.srs[w.id];S.srs[w.id]=sm2(S.srs[w.id],q);S.known[w.id]=q>=4;logIt(isNew);save()}
const ivl=d=>d<1?'10 phút':d<30?d+' ngày':Math.round(d/30)+' tháng';

/* ---------- data ---------- */
let pages=[],words=[];
async function loadData(){pages=(await (await fetch('data/pages.json')).json()).pages;
 const all=await Promise.all(pages.map(p=>fetch(p.file).then(r=>r.json()).then(ws=>ws.map(w=>({...w,page:p.id})))));words=all.flat()}
const F=()=>S.set.f;
function deck(){const f=F();return words.filter(w=>(!f.page||w.page==f.page)&&(!f.day||w.tags.includes(f.day))&&(!f.cefr||w.cefr.includes(f.cefr))&&(!f.task1||w.tags.includes('ielts-task1'))&&(!f.star||S.star[w.id]))}
function deckName(){const f=F(),p=[];if(f.day)p.push('Ngày '+(+f.day.slice(3)));if(f.cefr)p.push(f.cefr);if(f.task1)p.push('Task 1');if(f.star)p.push('★ Gắn sao');return p.length?p.join(' · '):'Tất cả từ'}

/* ---------- audio ---------- */
const audio=new Audio();audio.preload='none';
function play(w){if(!w)return;try{audio.pause();audio.src=w.audio;audio.currentTime=0;audio.play().catch(()=>{})}catch(e){}}

/* ---------- ui helpers ---------- */
let toastT;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),1800)}
const app=$('#app');
function view(title,html,back=true){$('#title').textContent=title;$('#back').classList.toggle('hidden',!back);app.innerHTML=`<div class="view">${html}</div>`;app.focus({preventScroll:true});scrollTo(0,0)}
const answerText=w=>w.w.replace(/\s*\(.*?\)/g,'');
const norm=s=>s.toLowerCase().normalize('NFC').replace(/[’']/g,"'").replace(/[.!?]/g,'').replace(/\s+/g,' ').trim();
const accepts=w=>answerText(w).split(/,\s*/).map(norm);
function starBtn(w){return `<button class="st ${S.star[w.id]?'on':''}" data-star="${w.id}" aria-pressed="${!!S.star[w.id]}" aria-label="Gắn sao từ khó">★</button>`}
function backFace(w){return `${starBtn(w)}<button class="au" data-au="${w.id}" aria-label="Nghe phát âm">🔊</button>
 <div class="w" style="margin-top:20px">${esc(w.w)}</div><div class="ipa">${esc(w.ipa)}</div>
 <div class="tags"><span class="tag">${esc(w.pos)}</span><span class="tag lv">${esc(w.lv)}</span>${w.tags.includes('ielts-task1')?'<span class="tag">IELTS Task 1</span>':''}</div>
 <div class="vi" style="margin-top:10px">${esc(w.vi)}</div>
 <div class="sec"><div class="lab">Ví dụ</div><i>${esc(w.ex)}</i><br><span class="muted">${esc(w.exvi)}</span></div>
 <div class="sec"><div class="lab">Cụm từ · họ từ</div>${esc(w.col)}</div>${w.tip?`<div class="sec tip">💡 ${esc(w.tip)}</div>`:''}`}
function frontFace(w,dir){return dir=='en'?`${starBtn(w)}<button class="au" data-au="${w.id}" aria-label="Nghe phát âm">🔊</button><div class="w">${esc(w.w)}</div><div class="ipa">${esc(w.ipa)}</div><div class="tags"><span class="tag">${esc(w.pos)}</span></div>`
 :`${starBtn(w)}<div class="vi">${esc(w.vi)}</div><div class="tags"><span class="tag">${esc(w.pos)}</span></div><p class="muted">Từ tiếng Anh là gì?</p>`}
document.addEventListener('click',e=>{const a=e.target.closest('[data-au]');if(a){e.stopPropagation();play(words.find(w=>w.id==a.dataset.au));return}
 const s=e.target.closest('[data-star]');if(s){e.stopPropagation();const id=s.dataset.star;S.star[id]=!S.star[id];if(!S.star[id])delete S.star[id];save();$$(`[data-star="${id}"]`).forEach(b=>{b.classList.toggle('on',!!S.star[id]);b.setAttribute('aria-pressed',!!S.star[id])});buzz(10);toast(S.star[id]?'Đã gắn sao ★':'Đã bỏ sao')}},true);

/* ---------- confetti ---------- */
function confetti(){if(reduce)return;const c=$('#confetti'),x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;
 const cols=['#2b2321','#e9b949','#d9776a','#7fae8e','#8fb3d9','#c9bfb5'];
 const ps=Array.from({length:120},()=>({x:c.width/2,y:c.height*.35,vx:(Math.random()-.5)*14,vy:-Math.random()*14-4,s:Math.random()*7+4,r:Math.random()*6,vr:(Math.random()-.5)*.3,c:cols[Math.random()*6|0]}));
 let t=0;(function f(){x.clearRect(0,0,c.width,c.height);ps.forEach(p=>{p.vy+=.35;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);x.restore()});
 if(++t<150)requestAnimationFrame(f);else x.clearRect(0,0,c.width,c.height)})();buzz([30,40,30])}

/* ---------- filter sheet ---------- */
function openFilter(){const f=F(),days=[...new Set(words.flatMap(w=>w.tags.filter(t=>/^day/.test(t))))].sort();
 const chips=(k,opts)=>`<div class="chips" role="group">${opts.map(([v,l])=>`<button class="chip ${(f[k]||'')==v?'on':''}" data-k="${k}" data-v="${v}" aria-pressed="${(f[k]||'')==v}">${l}</button>`).join('')}</div>`;
 const sh=$('#sheet');sh.innerHTML=`<div><h3 style="margin-top:0">Chọn bộ từ</h3>
 ${pages.length>1?'<div class="lab">Trang</div>'+chips('page',[['','Tất cả'],...pages.map(p=>[p.id,p.short||p.title])]):''}
 <div class="lab">Ngày học</div>${chips('day',[['','Tất cả'],...days.map(d=>[d,'Ngày '+(+d.slice(3))])])}
 <div class="lab" style="margin-top:8px">Cấp độ CEFR</div>${chips('cefr',[['','Tất cả'],['A1','A1'],['A2','A2'],['B1','B1'],['B2','B2']])}
 <div class="opt-row"><label for="f-t1">Chỉ từ IELTS Task 1</label><input class="sw" type="checkbox" id="f-t1" ${f.task1?'checked':''}></div>
 <div class="opt-row"><label for="f-st">Chỉ từ gắn sao ★</label><input class="sw" type="checkbox" id="f-st" ${f.star?'checked':''}></div>
 <p class="muted" id="fcount"></p><button class="btn" id="fdone">Xong</button></div>`;
 sh.classList.remove('hidden');const cnt=()=>$('#fcount').textContent=deck().length+' từ được chọn';cnt();
 $$('.chip',sh).forEach(b=>b.onclick=()=>{f[b.dataset.k]=b.dataset.v;$$(`.chip[data-k="${b.dataset.k}"]`,sh).forEach(x=>{x.classList.toggle('on',x==b);x.setAttribute('aria-pressed',x==b)});save();cnt();buzz(8)});
 $('#f-t1').onchange=e=>{f.task1=e.target.checked;save();cnt()};$('#f-st').onchange=e=>{f.star=e.target.checked;save();cnt()};
 const close=()=>{sh.classList.add('hidden');route()};$('#fdone').onclick=close;sh.onclick=e=>{if(e.target==sh)close()};$('#fdone').focus()}
document.addEventListener('keydown',e=>{if(e.key=='Escape'&&!$('#sheet').classList.contains('hidden')){$('#sheet').classList.add('hidden');route()}});

/* ---------- onboarding ---------- */
function onboarding(step=0,draft={...(S.user||{})}){const N=4,seg=`<div class="seg" aria-label="Bước ${step+1}/${N}">${[...Array(N)].map((_,i)=>`<i class="${i<=step?'on':''}"></i>`).join('')}</div>`;
 const nav=(b)=>{$('#title').textContent='';$('#back').classList.toggle('hidden',step==0);$('#back').onclick=()=>onboarding(step-1,draft)};
 const goals=[['10','10 từ','Nhẹ nhàng'],['25','25 từ','Vừa sức'],['50','50 từ','Chăm chỉ'],['all','Học hết toàn bộ','Không giới hạn']];
 const styles=[['cards','🃏','Thẻ ghi nhớ','lật thẻ, vuốt trái/phải, học hết cả bộ'],['learn','🧠','Học từng vòng','trắc nghiệm rồi gõ từ, nhớ sâu'],['review','⏰','Ôn theo lịch','đúng lúc sắp quên, tiết kiệm thời gian'],['mix','✨','Trộn đều','mỗi ngày một kiểu, không nhàm chán']];
 let html;
 if(step==0)html=`${mascot('wave','Chào bạn! Mình là Cú Bông 🦉<br>Bạn tên là gì?')}<input class="bigin" id="nm" placeholder="Tên của bạn" maxlength="24" autocomplete="given-name" aria-label="Tên của bạn" value="${esc(draft.name||'')}"><div class="grow"></div>
  <button class="btn" id="nx">Tiếp tục</button><button class="btn ghost" id="sk" style="margin-top:10px">Để sau</button>`;
 if(step==1)html=`${mascot('think',`Mỗi ngày ${esc(draft.name||'bạn')} muốn học bao nhiêu từ mới?`)}<div class="choice">${goals.map(([v,l,d])=>`<button class="chip ${(draft.goal||'25')==v?'on':''}" data-g="${v}" aria-pressed="${(draft.goal||'25')==v}">${l} <span class="muted" style="font-weight:500">· ${d}</span></button>`).join('')}</div>
  <p class="muted" style="text-align:center;margin-top:16px">Bạn luôn có thể “Học hết toàn bộ” bất cứ lúc nào.</p><div class="grow"></div><button class="btn" id="nx">Chốt vậy nhé</button>`;
 if(step==2){const k=Math.max(0,styles.findIndex(x=>x[0]==(draft.style||'cards')));const st=styles[k];
  html=`${mascot('idle','Bạn thích học theo kiểu nào?')}<div class="pick">${mascot('happy',null,{small:true})}<h4>${st[2]}</h4><p>${st[3]}</p>
  <div class="dots" role="radiogroup">${styles.map((x,i)=>`<button role="radio" aria-checked="${i==k}" aria-label="${x[2]}" class="${i==k?'on':''}" data-s="${x[0]}">${x[1]}</button>`).join('')}</div></div><div class="grow"></div><button class="btn" id="nx">Nghe hợp lý đấy</button>`}
 if(step==3){const g=goals.find(x=>x[0]==(draft.goal||'25')),st=styles.find(x=>x[0]==(draft.style||'cards'));
  html=`${mascot('celebrate',`Đây là kế hoạch của ${esc(draft.name||'bạn')}!`)}<div class="plan">
  <div class="li"><span class="ic">1</span><div><b>${g[1]} mỗi ngày</b><small>Cú Bông sẽ nhắc bạn giữ chuỗi ngày học 🔥</small></div></div>
  <div class="li"><span class="ic">2</span><div><b>${st[2]}</b><small>${st[3]}</small></div></div>
  <div class="li"><span class="ic">3</span><div><b>252 từ Oxford 3000 · IELTS</b><small>có phát âm, ví dụ, mẹo nhớ; chạy cả khi offline</small></div></div></div>
  <p class="muted" style="text-align:center">Tiến độ chỉ lưu trên điện thoại này.</p><div class="grow"></div><button class="btn" id="nx">Bắt đầu</button>`}
 view('',`<div class="ob">${seg}${html}</div>`,step>0);nav();
 if(step==0){const nm=$('#nm');nm.onkeydown=e=>{if(e.key=='Enter')$('#nx').click()};$('#nx').onclick=()=>{draft.name=nm.value.trim();onboarding(1,draft)};$('#sk').onclick=()=>{draft.name='';onboarding(1,draft)}}
 if(step==1){$$('[data-g]').forEach(b=>b.onclick=()=>{draft.goal=b.dataset.g;buzz(8);onboarding(1,draft)});$('#nx').onclick=()=>{draft.goal=draft.goal||'25';onboarding(2,draft)}}
 if(step==2){$$('[data-s]').forEach(b=>b.onclick=()=>{draft.style=b.dataset.s;buzz(8);onboarding(2,draft)});$('#nx').onclick=()=>{draft.style=draft.style||'cards';onboarding(3,draft)}}
 if(step==3)$('#nx').onclick=()=>{S.user={...draft,done:true,since:today()};save();confetti();$('#back').onclick=()=>{location.hash='#/'};location.hash='#/';route()}}

/* ---------- home ---------- */
function home(){const d=deck(),now=Date.now(),learned=d.filter(w=>S.srs[w.id]&&S.srs[w.id].reps).length,due=d.filter(w=>S.srs[w.id]&&S.srs[w.id].due<=now).length;
 let streak=0;for(let x=new Date();S.log[ymd(x)];x=new Date(x-DAY))streak++;const yest=S.log[ymd(new Date(now-DAY))];
 const tl=S.log[today()]||{rev:0,new:0},stars=Object.keys(S.star).length,g=newPerDay(),gl=g>=1e9?'∞':g,gp=g>=1e9?(tl.new?100:0):Math.min(100,tl.new/g*100);
 const hr=new Date().getHours(),hi=hr<11?'Chào buổi sáng':hr<18?'Chào buổi chiều':'Chào buổi tối';
 let st='wave',msg=`${hi}, ${esc(uname())}!<br>Hôm nay mình học ${g>=1e9?'hết toàn bộ':g+' từ'} nhé?`;
 if(!tl.rev&&yest&&!S.log[today()]){st='sleepy';msg=`Cú Bông buồn ngủ quá… Học vài từ để giữ chuỗi ${streak+1} ngày nhé!`}
 else if(tl.new>=g&&g<1e9){st='happy';msg=`Xong mục tiêu hôm nay rồi! Giỏi quá ${esc(uname())} 🎉`}
 else if(!d.length){st='meditate';msg='Bộ từ đang trống. Đổi bộ lọc nhé.'}
 const style=(S.user&&S.user.style)||'cards',main=style=='mix'?['cards','learn','review'][new Date().getDate()%3]:style;
 const ML={cards:['🃏','Thẻ ghi nhớ','Lật thẻ, vuốt phải “đã biết”, trái “đang học” · học hết toàn bộ'],learn:['🧠','Học','Từng vòng: trắc nghiệm → gõ từ'],review:['⏰','Ôn theo lịch',`${due} thẻ cần ôn · ${gl} từ mới/ngày`],match:['⚡','Ghép thẻ',S.best.match?'Kỷ lục '+(S.best.match/1000).toFixed(1)+' giây':'Ghép nhanh nhất có thể'],test:['📝','Kiểm tra','20 câu hỗn hợp, chấm điểm'],list:['📖','Danh sách từ',`Tìm, nghe, gắn sao (${stars} ★)`],stats:['📊','Thống kê','Tiến độ theo cấp độ']};
 const M=k=>`<button class="mode ${k==main?'wide':''}" data-go="${k}"><span class="e" aria-hidden="true">${ML[k][0]}</span><span><b>${ML[k][1]}</b><br><small>${ML[k][2]}</small></span></button>`;
 view('',`${mascot(st,msg)}
 <section class="today"><div class="t"><b>Hôm nay</b><span class="muted">🔥 ${streak} ngày liên tiếp</span></div><div class="t" style="margin-top:4px"><span class="n">${tl.new}<span class="muted" style="font-size:16px"> / ${gl} từ mới</span></span><span class="muted">${tl.rev} lượt</span></div>
 <div class="bar" role="progressbar" aria-valuenow="${Math.round(gp)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${gp}%"></i></div>
 <div class="kpis"><span><b>${learned}</b>đã học</span><span><b>${due}</b>cần ôn</span><span><b>${d.length}</b>${esc(deckName())}</span></div></section>
 <div class="chips"><button class="chip on" id="filt">⚙︎ Chọn bộ từ</button>${['day01','day02','day03','day04','day05','day06','day07','day08','day09','day10'].filter(x=>words.some(w=>w.tags.includes(x))).map(x=>`<button class="chip ${F().day==x?'on':''}" data-day="${x}" aria-pressed="${F().day==x}">Ngày ${+x.slice(3)}</button>`).join('')}</div>
 <div class="modes">${M(main)}${['cards','learn','review','match','test','list','stats'].filter(k=>k!=main).map(M).join('')}</div>
 <button class="btn ghost" id="redo" style="margin-top:18px">Đổi tên, mục tiêu, kiểu học</button>
 <p class="muted" style="text-align:center;margin-top:14px">Tiến độ lưu riêng trên thiết bị này · thêm vào màn hình chính để học offline.</p>`,false);
 $('#filt').onclick=openFilter;$$('[data-day]').forEach(b=>b.onclick=()=>{F().day=F().day==b.dataset.day?'':b.dataset.day;save();home();buzz(8)});$('#redo').onclick=()=>onboarding(0);
 $$('[data-go]').forEach(b=>b.onclick=()=>{if(!deck().length&&b.dataset.go!='stats'){toast('Bộ từ đang trống – hãy đổi bộ lọc');return}location.hash='#/'+b.dataset.go})}

/* ---------- swipeable card ---------- */
function makeCard(stage,w,dir,onSwipe){const el=document.createElement('div');el.className='fc';el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label','Thẻ: chạm để lật');
 el.innerHTML=`<div class="inner"><div class="face f">${frontFace(w,dir)}</div><div class="face b">${backFace(w)}</div></div><span class="lbl L">ĐANG HỌC</span><span class="lbl K">ĐÃ BIẾT</span>`;
 stage.appendChild(el);let sx=0,sy=0,dx=0,t0=0,drag=false,moved=false;const L=$('.lbl.L',el),K=$('.lbl.K',el);
 const flip=()=>{el.classList.toggle('flip');buzz(8);if(el.classList.contains('flip')&&dir=='vi'&&S.set.autoplay)play(w)};
 el.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;drag=true;moved=false;sx=e.clientX;sy=e.clientY;dx=0;t0=performance.now();el.style.transition='none';el.setPointerCapture(e.pointerId)});
 el.addEventListener('pointermove',e=>{if(!drag)return;dx=e.clientX-sx;const dy=e.clientY-sy;if(Math.abs(dx)>8)moved=true;if(!moved)return;
  el.style.transform=`translate(${dx}px,${dy*.15}px) rotate(${dx/18}deg)`;const o=Math.min(1,Math.abs(dx)/110);L.style.opacity=dx<0?o:0;K.style.opacity=dx>0?o:0});
 const end=()=>{if(!drag)return;drag=false;if(!moved){flip();return}const v=Math.abs(dx)/(performance.now()-t0);
  if(Math.abs(dx)>110||v>.6){fling(dx>0)}else{el.style.transition='transform .45s cubic-bezier(.2,1.6,.4,1)';el.style.transform='';L.style.opacity=K.style.opacity=0}};
 el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
 function fling(right){buzz(15);el.style.transition='transform .35s ease-out,opacity .35s';el.style.transform=`translate(${right?1:-1}*0px)`;el.style.transform=`translate(${(right?1:-1)*innerWidth*1.2}px,40px) rotate(${right?24:-24}deg)`;el.style.opacity=0;(right?K:L).style.opacity=1;setTimeout(()=>{el.remove();onSwipe(right)},reduce?0:260)}
 el.addEventListener('keydown',e=>{if(e.key==' '||e.key=='Enter'){e.preventDefault();flip()}});
 return {el,flip,fling};}

/* ---------- flashcards (Quizlet style, no limit) ---------- */
let FC=null;
function cards(){const d=deck();if(!FC||FC.sig!=JSON.stringify(F()))FC={sig:JSON.stringify(F()),queue:d.map(w=>w.id),i:0,know:0,learn:0,hist:[],shuffled:false};
 render();
 function render(){const total=FC.queue.length;if(FC.i>=total)return done();const w=words.find(x=>x.id==FC.queue[FC.i]);
  view('Thẻ ghi nhớ',`${mascot(FC.i==0?'wave':'idle',FC.i==0?'Chạm để lật · vuốt phải nếu đã biết':FC.tip||'Tiếp tục nào!',{small:true,row:true})}<div class="prog"><span class="pill l" aria-label="Đang học">${FC.learn}</span><div class="bar" aria-hidden="true"><i style="width:${FC.i/total*100}%"></i></div><span class="pill k" aria-label="Đã biết">${FC.know}</span></div>
  <p class="muted" style="text-align:center;margin:-4px 0 8px">${FC.i+1} / ${total}</p><div class="stage" id="stage"></div>
  <div class="yn"><button class="btn l" id="nL">✕ Đang học</button><button class="btn k" id="nK">✓ Đã biết</button></div>
  <div class="ctrl"><button class="ib" id="undo" aria-label="Hoàn tác" ${FC.hist.length?'':'disabled'}>↶</button><button class="ib ${FC.shuffled?'on':''}" id="shuf" aria-label="Trộn thẻ" aria-pressed="${FC.shuffled}">🔀</button>
  <button class="ib" id="flipb" aria-label="Lật thẻ">⟲</button><button class="ib ${S.set.dir=='vi'?'on':''}" id="dirb" aria-label="Đổi chiều Anh/Việt">${S.set.dir=='en'?'EN':'VI'}</button><button class="ib ${S.set.autoplay?'on':''}" id="autob" aria-label="Tự phát âm" aria-pressed="${S.set.autoplay}">🔈</button></div>
  <p class="muted hint">Chạm để lật · vuốt phải: đã biết · vuốt trái: đang học · phím ← →</p>`);
  const c=makeCard($('#stage'),w,S.set.dir,right=>{FC.tip=right?['Tuyệt! Đã biết ✓','Nhớ tốt lắm!','Giỏi quá!'][Math.random()*3|0]:'Không sao, mình sẽ gặp lại từ này';FC.mood=right?'happy':'sad';FC.hist.push({id:w.id,right});right?FC.know++:FC.learn++;grade(w,right?4:0);if(!right)FC.queue.push(w.id);FC.i++;render()});
  if(FC.mood){moodTo($('.mascot'),FC.mood,null,1400);FC.mood=null}
  if(S.set.dir=='en'&&S.set.autoplay)play(w);
  $('#nL').onclick=()=>c.fling(false);$('#nK').onclick=()=>c.fling(true);$('#flipb').onclick=c.flip;
  $('#undo').onclick=()=>{const h=FC.hist.pop();if(!h)return;FC.i--;h.right?FC.know--:FC.learn--;if(!h.right)FC.queue.pop();render()};
  $('#shuf').onclick=()=>{FC.shuffled=!FC.shuffled;const rest=FC.queue.slice(FC.i);FC.queue=FC.queue.slice(0,FC.i).concat(FC.shuffled?shuffle(rest):rest.sort((a,b)=>a.localeCompare(b)));toast(FC.shuffled?'Đã trộn thẻ':'Theo thứ tự');render()};
  $('#dirb').onclick=()=>{S.set.dir=S.set.dir=='en'?'vi':'en';save();render()};$('#autob').onclick=()=>{S.set.autoplay=!S.set.autoplay;save();render()};
  keys=e=>{if(e.target.tagName=='INPUT')return;if(e.key=='ArrowRight')c.fling(true);else if(e.key=='ArrowLeft')c.fling(false);else if(e.key==' '){e.preventDefault();c.flip()}};
  c.el.focus({preventScroll:true})}
 function done(){confetti();const learning=[...new Set(FC.hist.filter(h=>!h.right).map(h=>h.id))];
  view('Thẻ ghi nhớ',`<div class="res">${mascot('celebrate','Bạn đã đi hết bộ thẻ! 🎉')}<p>${FC.know} lần “đã biết” · ${FC.learn} lần “đang học”</p>
  <div class="row"><button class="btn ghost" id="again">Bắt đầu lại</button><button class="btn" id="learnm">Chế độ Học</button></div></div>`);
  $('#again').onclick=()=>{FC=null;cards()};$('#learnm').onclick=()=>location.hash='#/learn'}}
let keys=null;document.addEventListener('keydown',e=>keys&&keys(e));

/* ---------- SRS review ---------- */
function review(){const d=deck(),now=Date.now(),due=d.filter(w=>S.srs[w.id]&&S.srs[w.id].due<=now).sort((a,b)=>S.srs[a.id].due-S.srs[b.id].due);
 const left=Math.max(0,newPerDay()-((S.log[today()]||{}).new||0));let q=due.concat(d.filter(w=>!S.srs[w.id]).slice(0,left)),n=0;const tot=q.length;
 (function nx(){const w=q.shift();if(!w){if(n)confetti();view('Ôn theo lịch',`<div class="res">${mascot(n?'celebrate':'meditate',n?'Xong lượt ôn hôm nay!':'Không có thẻ cần ôn. Thư giãn chút nhé…')}<p class="muted">Muốn học tiếp? “Thẻ ghi nhớ” cho phép học hết toàn bộ, không giới hạn.</p><button class="btn" onclick="location.hash='#/cards'">Học hết toàn bộ</button></div>`);return}
  const st=S.srs[w.id];const b=[0,3,4,5].map(g=>[g,ivl(g<3?0:sm2(st,g).int)]);
  view('Ôn theo lịch',`<div class="prog"><div class="bar"><i style="width:${n/tot*100}%"></i></div><span>${tot-n}</span></div><div class="stage" id="stage"></div>
  <div class="yn hidden" id="gr" style="grid-template-columns:repeat(4,1fr)">${b.map(([g,t],i)=>`<button class="btn sm" style="width:100%;flex-direction:column;gap:0;background:${['#ff725b','#f59e0b','#18ae79','#4255ff'][i]}" data-g="${g}">${['Quên','Khó','Nhớ','Dễ'][i]}<small style="font-weight:400">${t}</small></button>`).join('')}</div>
  <button class="btn" id="show" style="margin-top:10px">Hiện đáp án</button><p class="muted hint">Vuốt phải = Nhớ · trái = Quên · phím 1–4</p>`);
  const c=makeCard($('#stage'),w,S.set.dir,right=>{grade(w,right?4:0);if(!right)q.splice(Math.min(3,q.length),0,w);n++;nx()});
  const reveal=()=>{if(!c.el.classList.contains('flip'))c.flip();$('#gr').classList.remove('hidden');$('#show').classList.add('hidden')};
  c.el.addEventListener('click',()=>setTimeout(()=>{if(c.el.classList.contains('flip')){$('#gr').classList.remove('hidden');$('#show').classList.add('hidden')}},0));
  $('#show').onclick=reveal;$$('[data-g]').forEach(x=>x.onclick=()=>{const g=+x.dataset.g;grade(w,g);if(g<3)q.splice(Math.min(3,q.length),0,w);n++;buzz(10);nx()});
  if(S.set.dir=='en'&&S.set.autoplay)play(w);
  keys=e=>{if(e.key==' '){e.preventDefault();reveal()}else if('1234'.includes(e.key)&&!$('#gr').classList.contains('hidden'))$$('[data-g]')[e.key-1].click()}})()}

/* ---------- Learn (adaptive rounds: MC → typing) ---------- */
function learn(){const d=deck(),ROUND=7;let round=[],ri=0,rc=0;
 const lv=w=>S.learn[w.id]||0;
 function start(){const pend=d.filter(w=>lv(w)<2);if(!pend.length)return finished();
  const cur=pend.filter(w=>S.learn[w.id]!=null);const fresh=pend.filter(w=>S.learn[w.id]==null);
  round=shuffle(cur).concat(fresh).slice(0,ROUND);round=shuffle(round);ri=0;rc=0;ask()}
 function header(){const m=d.filter(w=>lv(w)>=2).length,f=d.filter(w=>lv(w)==1).length;
  return `${mascot('think',['Từ này nghĩa là gì nhỉ?','Bình tĩnh suy nghĩ nhé…','Bạn làm được mà!'][ri%3],{small:true,row:true})}<div class="prog" aria-label="Tiến độ"><div class="bar" style="position:relative"><i style="width:${(m+f*.5)/d.length*100}%"></i></div><span>${m}/${d.length}</span></div><p class="muted">Vòng hiện tại: ${ri+1}/${round.length} · ${f} từ đang quen dần</p>`}
 function ask(){if(ri>=round.length)return roundEnd();const w=round[ri],typing=lv(w)>=1,en=Math.random()<.5;
  if(!typing){const opts=shuffle([w,...shuffle(words.filter(x=>x.id!=w.id&&x.pos.split(',')[0]==w.pos.split(',')[0])).concat(shuffle(words.filter(x=>x.id!=w.id))).filter((x,i,a)=>a.indexOf(x)==i).slice(0,3)]);
   view('Học',header()+`<div class="q"><div class="kind">${en?'Thuật ngữ':'Định nghĩa'}</div><div class="term">${esc(en?w.w:w.vi)}</div>${en?`<button class="ib" data-au="${w.id}" aria-label="Nghe">🔊</button>`:''}
   <div class="kind" style="margin-bottom:8px">Chọn đáp án đúng</div><div class="opts">${opts.map((o,i)=>`<button class="opt" data-id="${o.id}"><span class="n">${i+1}</span>${esc(en?o.vi:o.w)}</button>`).join('')}</div><div id="fb"></div></div>`);
   if(en&&S.set.autoplay)play(w);
   const pick=b=>{if($('.opt[disabled]'))return;const ok=b.dataset.id==w.id;$$('.opt').forEach(x=>{x.disabled=true;if(x.dataset.id==w.id)x.classList.add('ok')});if(!ok)b.classList.add('bad');res(w,ok,1)};
   $$('.opt').forEach(b=>b.onclick=()=>pick(b));keys=e=>{if('1234'.includes(e.key)&&$$('.opt')[e.key-1])pick($$('.opt')[e.key-1])}}
  else{view('Học',header()+`<div class="q"><div class="kind">Định nghĩa</div><div class="term">${esc(w.vi)}</div><div class="tags" style="margin:-8px 0 14px"><span class="tag">${esc(w.pos)}</span></div>
   <div class="kind" style="margin-bottom:8px">Gõ từ tiếng Anh</div><input class="ti" id="ti" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Nhập đáp án" enterkeyhint="done">
   <div class="row"><button class="btn ghost" id="dk">Không biết?</button><button class="btn" id="ck">Kiểm tra</button></div><div id="fb"></div></div>`);
   const ti=$('#ti');setTimeout(()=>ti.focus(),50);
   const chk=give=>{if(ti.disabled)return;const ok=!give&&accepts(w).includes(norm(ti.value));ti.disabled=true;ti.classList.add(ok?'ok':'bad');$('#ck').parentNode.remove();res(w,ok,2)};
   $('#ck').onclick=()=>chk(false);$('#dk').onclick=()=>chk(true);ti.onkeydown=e=>{if(e.key=='Enter')chk(false)};keys=null}}
 function res(w,ok,to){if(ok){S.learn[w.id]=Math.max(lv(w),to);rc++;buzz(12);grade(w,4)}else{S.learn[w.id]=0;buzz([40,30,40]);grade(w,0)}save();play(w);
  moodTo($('.mascot'),ok?'happy':'sad',ok?['Chính xác! 🎯','Tuyệt vời! ✨','Giỏi lắm! 💪'][Math.random()*3|0]:'Chưa đúng rồi, xem lại nhé');
  const fb=$('#fb');fb.innerHTML=`<div class="fb ${ok?'ok':'bad'}">${ok?'✓ '+esc(w.w)+' = '+esc(w.vi):'Đáp án: <b>'+esc(w.w)+'</b> = '+esc(w.vi)}</div>${ok?'':`<p class="muted">${esc(w.ex)}</p>`}<button class="btn" id="nx" style="margin-top:10px">Tiếp tục</button>`;
  const go=()=>{ri++;ask()};$('#nx').onclick=go;$('#nx').focus();if(ok)setTimeout(()=>{if($('#nx')&&document.activeElement==$('#nx'))go()},900);keys=e=>{if(e.key=='Enter'&&$('#nx')){e.preventDefault();go()}}}
 function roundEnd(){confetti();const m=d.filter(w=>lv(w)>=2).length;
  view('Học',`<div class="res">${mascot('celebrate','Hoàn thành vòng! 🏁')}<p>Đúng ${rc}/${round.length} câu · đã thuộc ${m}/${d.length} từ</p>
  <div class="list">${round.map(w=>`<div class="it"><div><b>${esc(w.w)}</b> – ${esc(w.vi)}</div><span>${lv(w)>=2?'✅':lv(w)==1?'🟡':'🔴'}</span></div>`).join('')}</div><button class="btn" id="nr" style="margin-top:12px">Vòng tiếp theo</button></div>`);
  $('#nr').onclick=start;$('#nr').focus();keys=e=>{if(e.key=='Enter')start()}}
 function finished(){confetti();view('Học',`<div class="res">${mascot('celebrate',`Bạn đã thuộc cả ${d.length} từ! 🏆`)}<p class="muted">Hãy làm bài Kiểm tra, hoặc học lại từ đầu.</p>
  <div class="row"><button class="btn ghost" id="rs">Học lại từ đầu</button><button class="btn" onclick="location.hash='#/test'">Kiểm tra</button></div></div>`);$('#rs').onclick=()=>{d.forEach(w=>delete S.learn[w.id]);save();start()}}
 start()}

/* ---------- Match game ---------- */
function match(){const d=deck();if(d.length<3){toast('Cần ít nhất 3 từ');return home()}
 const N=Math.min(6,d.length);
 function intro(){view('Ghép thẻ',`<div class="res">${mascot('idle','Sẵn sàng chơi chưa? ⚡')}<p>Ghép ${N} cặp từ tiếng Anh với nghĩa tiếng Việt nhanh nhất có thể. Ghép sai bị cộng 1 giây.</p>${S.best.match?`<p>🏆 Kỷ lục: <b>${(S.best.match/1000).toFixed(1)} giây</b></p>`:''}<button class="btn" id="go">Bắt đầu</button></div>`);$('#go').onclick=play_;$('#go').focus()}
 function play_(){const ps=shuffle(d).slice(0,N);const tiles=shuffle(ps.flatMap(w=>[{id:w.id,t:w.w,k:'en'},{id:w.id,t:w.vi,k:'vi'}]));let sel=null,left=N,pen=0;const t0=performance.now();
  view('Ghép thẻ',`<div class="timer" id="tm" aria-live="off">0.0 giây</div><div class="mgrid">${tiles.map((x,i)=>`<button class="tile" data-i="${i}" lang="${x.k=='en'?'en':'vi'}">${esc(x.t)}</button>`).join('')}</div>`);
  let raf;const tick=()=>{const e=$('#tm');if(!e)return;e.textContent=((performance.now()-t0)/1000+pen).toFixed(1)+' giây';raf=requestAnimationFrame(tick)};tick();
  $$('.tile').forEach(b=>b.onclick=()=>{const x=tiles[b.dataset.i];if(!sel){sel=b;b.classList.add('sel');buzz(6);return}if(sel==b){b.classList.remove('sel');sel=null;return}
   const y=tiles[sel.dataset.i];if(x.id==y.id&&x.k!=y.k){b.classList.add('ok');sel.classList.add('ok');buzz(12);if(x.k=='en')play(words.find(w=>w.id==x.id));else play(words.find(w=>w.id==y.id));sel=null;if(--left==0){cancelAnimationFrame(raf);finish((performance.now()-t0)+pen*1000)}}
   else{const s=sel;[s,b].forEach(z=>{z.classList.remove('sel');z.classList.add('bad')});pen+=1;buzz([40,30,40]);setTimeout(()=>[s,b].forEach(z=>z.classList.remove('bad')),400);sel=null}})}
 function finish(ms){const rec=!S.best.match||ms<S.best.match;if(rec)S.best.match=Math.round(ms);save();confetti();
  view('Ghép thẻ',`<div class="res">${mascot('celebrate',rec?'Kỷ lục mới! 🏆':'Xong rồi, nhanh quá!')}<div class="big">${(ms/1000).toFixed(1)}s</div><p>${rec?'Kỷ lục mới!':'Kỷ lục của bạn: '+(S.best.match/1000).toFixed(1)+'s'}</p><div class="row"><button class="btn ghost" onclick="location.hash='#/'">Trang chủ</button><button class="btn" id="pa">Chơi lại</button></div></div>`);$('#pa').onclick=play_}
 intro()}

/* ---------- Test ---------- */
function test(){const d=deck();if(d.length<4){toast('Cần ít nhất 4 từ');return home()}
 const n=Math.min(20,d.length),qs=shuffle(d).slice(0,n).map((w,i)=>{const t=i%3==0?'type':i%3==1?'mc':'tf';const q={w,t};
  if(t=='mc'){q.opts=shuffle([w,...shuffle(d.length>=4?d.filter(x=>x.id!=w.id):words.filter(x=>x.id!=w.id)).slice(0,3)])}
  if(t=='tf'){q.truth=Math.random()<.5;q.shown=q.truth?w:shuffle(words.filter(x=>x.id!=w.id))[0]}return q});
 view('Kiểm tra',`<p class="muted">${n} câu · Gõ từ, trắc nghiệm và Đúng/Sai</p>`+qs.map((q,i)=>`<div class="q" style="margin-bottom:12px" data-q="${i}"><div class="kind">Câu ${i+1}/${n} · ${q.t=='type'?'Gõ từ tiếng Anh':q.t=='mc'?'Chọn nghĩa đúng':'Đúng hay sai?'}</div>
  ${q.t=='type'?`<div class="term">${esc(q.w.vi)}</div><input class="ti" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Đáp án câu ${i+1}">`
  :q.t=='mc'?`<div class="term">${esc(q.w.w)}</div><div class="opts" role="radiogroup">${q.opts.map(o=>`<button class="opt" role="radio" aria-checked="false" data-id="${o.id}">${esc(o.vi)}</button>`).join('')}</div>`
  :`<div class="term">${esc(q.w.w)} <span class="muted">=</span> ${esc(q.shown.vi)}</div><div class="row" role="radiogroup"><button class="opt" role="radio" aria-checked="false" data-tf="1">✓ Đúng</button><button class="opt" role="radio" aria-checked="false" data-tf="0">✕ Sai</button></div>`}</div>`).join('')+`<button class="btn" id="sub">Nộp bài</button>`);
 $$('.q').forEach(c=>$$('.opt',c).forEach(b=>b.onclick=()=>{$$('.opt',c).forEach(x=>{x.style.borderColor='';x.setAttribute('aria-checked','false')});b.style.borderColor='var(--pri)';b.setAttribute('aria-checked','true');c.dataset.a=b.dataset.id||b.dataset.tf;buzz(6)}));
 $('#sub').onclick=()=>{let sc=0;const wrong=[];qs.forEach((q,i)=>{const c=$(`[data-q="${i}"]`);let ok;
  if(q.t=='type')ok=accepts(q.w).includes(norm($('.ti',c).value));else if(q.t=='mc')ok=c.dataset.a==q.w.id;else ok=c.dataset.a==(q.truth?'1':'0');
  if(ok)sc++;else wrong.push(q.w);grade(q.w,ok?4:0)});const p=Math.round(sc/n*100);if(p>=80)confetti();
  view('Kết quả',`<div class="res">${mascot(p>=80?'celebrate':p>=50?'happy':'sad',p>=80?'Xuất sắc! Cú Bông tự hào lắm':p>=50?'Khá lắm, cố thêm chút nữa!':'Không sao, ôn lại rồi thử lại nhé')}<div class="big">${p}%</div><p>Đúng ${sc}/${n} câu · ${p>=80?'Xuất sắc! 🎉':p>=50?'Khá tốt, cố thêm nhé!':'Ôn lại nhé 💪'}</p></div>
  ${wrong.length?`<h3>Cần ôn lại (${wrong.length})</h3><div class="list">${wrong.map(w=>`<div class="it"><div><b>${esc(w.w)}</b> <span class="muted">${esc(w.ipa)}</span><br>${esc(w.vi)}</div><button class="ib" data-au="${w.id}" aria-label="Nghe">🔊</button>${starBtn(w).replace('class="st','class="ib st').replace('position','')}</div>`).join('')}</div>`:''}
  <div class="row"><button class="btn ghost" onclick="location.hash='#/'">Trang chủ</button><button class="btn" id="rt">Làm bài mới</button></div>`);$('#rt').onclick=test}}

/* ---------- list & stats ---------- */
function list(){const d=deck();view('Danh sách từ',`<input class="search" type="search" id="sq" placeholder="Tìm từ hoặc nghĩa…" aria-label="Tìm kiếm"><p class="muted" id="lc"></p><div class="list" id="ls"></div>`);
 const r=()=>{const q=norm($('#sq').value);const xs=d.filter(w=>!q||norm(w.w).includes(q)||norm(w.vi).includes(q));$('#lc').textContent=xs.length+' từ';
  $('#ls').innerHTML=xs.length?'':mascot('meditate','Không tìm thấy từ nào…');if(xs.length)$('#ls').innerHTML=xs.map(w=>`<div class="it"><div><b>${esc(w.w)}</b> <span class="muted">${esc(w.ipa)}</span> <span class="tag lv">${esc(w.lv)}</span><br>${esc(w.vi)}</div><button class="ib" data-au="${w.id}" aria-label="Nghe ${esc(w.w)}">🔊</button><button class="ib st ${S.star[w.id]?'on':''}" style="position:static" data-star="${w.id}" aria-pressed="${!!S.star[w.id]}" aria-label="Gắn sao">★</button></div>`).join('')};
 $('#sq').oninput=r;r()}
function stats(){const d=deck(),now=Date.now(),L=d.filter(w=>S.srs[w.id]&&S.srs[w.id].reps).length,M=d.filter(w=>S.srs[w.id]&&S.srs[w.id].int>=21).length,D=d.filter(w=>S.srs[w.id]&&S.srs[w.id].due<=now).length;
 const days=[...Array(7)].map((_,i)=>ymd(new Date(now-(6-i)*DAY))),mx=Math.max(1,...days.map(x=>(S.log[x]||{}).rev||0));
 view('Thống kê',`<div class="stat"><div><b>${L}/${d.length}</b><span class="muted">đã học</span></div><div><b>${D}</b><span class="muted">cần ôn</span></div><div><b>${M}</b><span class="muted">nhớ lâu ≥21 ngày</span></div><div><b>${Object.keys(S.star).length}</b><span class="muted">gắn sao ★</span></div></div>
 <h3>Theo cấp độ</h3>${['A1','A2','B1','B2'].map(l=>{const a=d.filter(w=>w.cefr.includes(l)),b=a.filter(w=>S.srs[w.id]&&S.srs[w.id].reps).length;return a.length?`<div class="deck"><div><b>${l}</b> <span class="muted">${b}/${a.length}</span><div class="bar"><i style="width:${b/a.length*100}%"></i></div></div></div>`:''}).join('')}
 <h3>7 ngày qua</h3><div class="deck" style="align-items:flex-end;height:140px">${days.map(x=>{const v=(S.log[x]||{}).rev||0;return `<div style="text-align:center;font-size:11px"><div style="height:${v/mx*90}px;background:var(--pri);border-radius:6px 6px 0 0;margin:0 3px" title="${v}"></div>${x.slice(8)}<br>${v}</div>`}).join('')}</div>
 <button class="btn ghost" id="rst" style="margin-top:20px;color:var(--bad);border-color:var(--bad)">Xoá toàn bộ tiến độ</button>`);
 $('#rst').onclick=()=>{if(confirm('Xoá toàn bộ tiến độ trên thiết bị này?')){S.srs={};S.known={};S.learn={};S.log={};S.best={};save();FC=null;stats();toast('Đã xoá')}}}

/* ---------- router & boot ---------- */
const R={'':home,cards,review,learn,match,test,list,stats};
function route(){keys=null;audio.pause();$('#back').onclick=()=>{location.hash='#/'};if(!S.user||!S.user.done)return onboarding(0);const k=location.hash.replace(/^#\/?/,'');(R[k]||home)()}
addEventListener('hashchange',route);$('#back').onclick=()=>{location.hash='#/'};
const applyTheme=()=>{document.body.classList.toggle('dark',!!S.set.dark);$('#theme').textContent=S.set.dark?'☀️':'🌙';$('meta[name=theme-color]').content=S.set.dark?'#1b1715':'#efece6'};
if(S.set.dark==null)S.set.dark=matchMedia('(prefers-color-scheme: dark)').matches;applyTheme();
$('#theme').onclick=()=>{S.set.dark=!S.set.dark;save();applyTheme()};
const applySnd=()=>{$('#sound').classList.toggle('off',!S.set.autoplay);$('#sound').setAttribute('aria-pressed',!!S.set.autoplay)};applySnd();
$('#sound').onclick=()=>{S.set.autoplay=!S.set.autoplay;save();applySnd();toast(S.set.autoplay?'Bật tự phát âm':'Tắt tự phát âm')};
if('serviceWorker' in navigator){const had=!!navigator.serviceWorker.controller;navigator.serviceWorker.register('sw.js').then(r=>{r.addEventListener('updatefound',()=>{const n=r.installing;n&&n.addEventListener('statechange',()=>{if(n.state=='activated'&&had)toast('Đã cập nhật phiên bản mới')})})}).catch(()=>{})}
loadData().then(route).catch(e=>{app.innerHTML='<p>Không tải được dữ liệu. Kiểm tra kết nối mạng rồi thử lại.</p>';console.error(e)});
