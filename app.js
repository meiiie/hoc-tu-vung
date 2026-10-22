'use strict';
/* Học Từ Vựng – Oxford 3000. Static PWA. Progress is stored per device in localStorage. */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const DAY=864e5,KEY='htv2',AUDIO_CACHE='htv-audio-v1';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const ymd=d=>d.toLocaleDateString('sv');const today=()=>ymd(new Date());
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const buzz=p=>{try{if(S.set.haptics!==false&&navigator.vibrate)navigator.vibrate(p)}catch(e){}};
const I=(n,c='')=>`<svg class="i ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;

/* ---------- state ---------- */
const blank={srs:{},known:{},star:{},learn:{},speak:{},log:{},best:{},user:null,set:{autoplay:true,dir:'en',voice:'gb',slow:false,theme:'system',haptics:true,f:{}}};
let S;try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}S=S||structuredClone(blank);
for(const k in blank)if(S[k]==null)S[k]=structuredClone(blank[k]);for(const k in blank.set)if(S.set[k]==null)S.set[k]=blank.set[k];
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast('Không lưu được tiến độ','info')}};
const logIt=isNew=>{const t=today(),l=S.log[t]=S.log[t]||{rev:0,new:0};l.rev++;if(isNew)l.new++};
const newPerDay=()=>S.user&&S.user.goal=='all'?1e9:+((S.user&&S.user.goal)||25);
const uname=()=>S.user&&S.user.name?S.user.name:'bạn';

/* ---------- SM-2 ---------- */
function sm2(st,q){st={ef:2.5,reps:0,int:0,lapses:0,...(st||{})};
 if(q<3){st.reps=0;st.int=0;st.lapses++;st.due=Date.now()+10*60e3}
 else{st.reps++;st.int=st.reps==1?(q==5?3:1):st.reps==2?(q==3?3:6):Math.max(1,Math.round(st.int*st.ef*(q==3?.8:q==5?1.3:1)));st.due=Date.now()+st.int*DAY}
 st.ef=Math.max(1.3,st.ef+0.1-(5-q)*(0.08+(5-q)*0.02));st.last=Date.now();return st}
function grade(w,q){const isNew=!S.srs[w.id];S.srs[w.id]=sm2(S.srs[w.id],q);S.known[w.id]=q>=4;logIt(isNew);save()}
const ivl=d=>d<1?'10 phút':d<30?d+' ngày':Math.round(d/30)+' tháng';

/* ---------- data ---------- */
let pages=[],words=[];
async function loadData(){const r=await fetch('data/pages.json');if(!r.ok)throw new Error('pages');pages=(await r.json()).pages;
 const all=await Promise.all(pages.map(p=>fetch(p.file).then(r=>{if(!r.ok)throw new Error(p.file);return r.json()}).then(ws=>ws.map(w=>({...w,page:p.id,num:w.id.split('-')[1]})))));words=all.flat()}
const F=()=>S.set.f;
function deck(){const f=F();return words.filter(w=>(!f.page||w.page==f.page)&&(!f.day||w.tags.includes(f.day))&&(!f.cefr||w.cefr.includes(f.cefr))&&(!f.task1||w.tags.includes('ielts-task1'))&&(!f.star||S.star[w.id]))}
function deckName(){const f=F(),p=[];if(f.day)p.push('Ngày '+(+f.day.slice(3)));if(f.cefr)p.push(f.cefr);if(f.task1)p.push('Task 1');if(f.star)p.push('Gắn sao');return p.length?p.join(' · '):'Tất cả từ'}
const byId=id=>words.find(w=>w.id==id);

/* ---------- audio ---------- */
const audio=new Audio();audio.preload='auto';let playingBtn=null;
const aurl=(w,kind='w',v=S.set.voice)=>`audio/${w.page}/${v}/${kind}/${w.num}.mp3`;
function play(w,kind='w',opt={}){if(!w)return;try{audio.pause();audio.src=aurl(w,kind);const slow=opt.slow??S.set.slow;audio.playbackRate=slow?0.7:1;audio.preservesPitch=true;audio.webkitPreservesPitch=true;
 if(playingBtn)playingBtn.classList.remove('playing');playingBtn=opt.btn||null;if(playingBtn)playingBtn.classList.add('playing');
 audio.play().catch(()=>{if(playingBtn)playingBtn.classList.remove('playing')})}catch(e){}}
audio.onended=audio.onerror=()=>{if(playingBtn)playingBtn.classList.remove('playing');playingBtn=null};
audio.addEventListener('error',()=>{if(!navigator.onLine)toast('Âm thanh này chưa được tải để dùng offline','wifi-off')});
const auBtns=(w,ex=true)=>`<button class="ib" data-au="${w.id}" data-k="w" aria-label="Nghe phát âm">${I('volume-2')}</button><button class="ib" data-au="${w.id}" data-k="w" data-slow="1" aria-label="Nghe chậm">${I('turtle')}</button>${ex?`<button class="ib" data-au="${w.id}" data-k="ex" aria-label="Nghe câu ví dụ">${I('book-open')}</button>`:''}`;

/* ---------- ui helpers ---------- */
let toastT;function toast(m,ic='check'){const t=$('#toast');t.innerHTML=I(ic,'s')+esc(m);t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),2000)}
const app=$('#app');
function view(title,html,back=true){$('#title').textContent=title;$('#back').classList.toggle('hidden',!back);app.innerHTML=`<div class="view">${html}</div>`;app.focus({preventScroll:true});scrollTo(0,0)}
const answerText=w=>w.w.replace(/\s*\(.*?\)/g,'');
const norm=s=>String(s).toLowerCase().normalize('NFC').replace(/[’']/g,"'").replace(/[.,!?;:"]/g,' ').replace(/\s+/g,' ').trim();
const accepts=w=>answerText(w).split(/,\s*/).map(norm);
const starBtn=w=>`<button class="ib star ${S.star[w.id]?'on':''}" data-star="${w.id}" aria-pressed="${!!S.star[w.id]}" aria-label="Gắn sao từ khó">${I('star')}</button>`;
function backFace(w){return `<div class="corner l">${starBtn(w)}</div><div class="corner r">${auBtns(w,false)}</div>
 <div class="w">${esc(w.w)}</div><div class="ipa">${esc(w.ipa)}</div>
 <div class="tags"><span class="tag">${esc(w.pos)}</span><span class="tag lv">${esc(w.lv)}</span>${w.tags.includes('ielts-task1')?'<span class="tag">IELTS Task 1</span>':''}</div>
 <div class="vi" style="margin-top:12px">${esc(w.vi)}</div>
 <div class="sec"><div class="lab">Ví dụ <button class="ib" style="min-height:32px;min-width:32px" data-au="${w.id}" data-k="ex" aria-label="Nghe câu ví dụ">${I('play','s')}</button></div><i>${esc(w.ex)}</i><br><span class="muted">${esc(w.exvi)}</span></div>
 <div class="sec"><div class="lab">Cụm từ · họ từ</div>${esc(w.col)}</div>${w.tip?`<div class="sec tip">${I('lightbulb','s')}<div>${esc(w.tip)}</div></div>`:''}`}
function frontFace(w,dir){return `<div class="corner l">${starBtn(w)}</div>`+(dir=='en'?`<div class="corner r"><button class="ib" data-au="${w.id}" data-k="w" aria-label="Nghe phát âm">${I('volume-2')}</button></div><div class="w">${esc(w.w)}</div><div class="ipa">${esc(w.ipa)}</div><div class="tags"><span class="tag">${esc(w.pos)}</span></div>`
 :`<div class="vi">${esc(w.vi)}</div><div class="tags"><span class="tag">${esc(w.pos)}</span></div><p class="muted">Từ tiếng Anh là gì?</p>`)}
document.addEventListener('click',e=>{const a=e.target.closest('[data-au]');if(a){e.stopPropagation();play(byId(a.dataset.au),a.dataset.k||'w',{slow:a.dataset.slow?true:undefined,btn:a});return}
 const s=e.target.closest('[data-star]');if(s){e.stopPropagation();const id=s.dataset.star;S.star[id]=!S.star[id];if(!S.star[id])delete S.star[id];save();$$(`[data-star="${id}"]`).forEach(b=>{b.classList.toggle('on',!!S.star[id]);b.setAttribute('aria-pressed',!!S.star[id])});buzz(10);toast(S.star[id]?'Đã gắn sao':'Đã bỏ sao','star')}},true);
['pointerdown'].forEach(ev=>document.addEventListener(ev,e=>{if(e.target.closest('[data-au],[data-star]'))e.stopPropagation()},true));

/* ---------- confetti ---------- */
function confetti(){if(reduce)return;const c=$('#confetti'),x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;const cs=getComputedStyle(document.body);
 const cols=['--primary','--success','--warn','--danger','--star'].map(v=>cs.getPropertyValue(v).trim());
 const ps=Array.from({length:110},()=>({x:c.width/2,y:c.height*.32,vx:(Math.random()-.5)*13,vy:-Math.random()*13-4,s:Math.random()*6+4,r:Math.random()*6,vr:(Math.random()-.5)*.3,c:cols[Math.random()*cols.length|0]}));
 let t=0;(function f(){x.clearRect(0,0,c.width,c.height);ps.forEach(p=>{p.vy+=.33;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);x.restore()});
 if(++t<140)requestAnimationFrame(f);else x.clearRect(0,0,c.width,c.height)})();buzz([20,30,20])}

/* ---------- sheets: filter & settings ---------- */
function sheet(html,onClose){const sh=$('#sheet');sh.innerHTML=`<div><div class="grab" aria-hidden="true"></div>${html}</div>`;sh.classList.remove('hidden');
 const close=()=>{sh.classList.add('hidden');onClose&&onClose()};sh.onclick=e=>{if(e.target==sh)close()};sh._close=close;return {sh,close}}
document.addEventListener('keydown',e=>{if(e.key=='Escape'&&!$('#sheet').classList.contains('hidden'))$('#sheet')._close()});
function openFilter(){const f=F(),days=[...new Set(words.flatMap(w=>w.tags.filter(t=>/^day/.test(t))))].sort();
 const chips=(k,opts)=>`<div class="chips" role="group">${opts.map(([v,l])=>`<button class="chip ${(f[k]||'')==v?'on':''}" data-k="${k}" data-v="${v}" aria-pressed="${(f[k]||'')==v}">${l}</button>`).join('')}</div>`;
 const {sh,close}=sheet(`<h2>Chọn bộ từ</h2>
 ${pages.length>1?'<div class="eyebrow">Trang</div>'+chips('page',[['','Tất cả'],...pages.map(p=>[p.id,p.short||p.title])]):''}
 <div class="eyebrow">Ngày học</div>${chips('day',[['','Tất cả'],...days.map(d=>[d,'Ngày '+(+d.slice(3))])])}
 <div class="eyebrow">Cấp độ CEFR</div>${chips('cefr',[['','Tất cả'],['A1','A1'],['A2','A2'],['B1','B1'],['B2','B2']])}
 <div class="group" style="margin-top:16px"><label class="opt-row"><span>Chỉ từ IELTS Task 1</span><input class="sw" type="checkbox" id="f-t1" ${f.task1?'checked':''}></label>
 <label class="opt-row"><span>Chỉ từ đã gắn sao</span><input class="sw" type="checkbox" id="f-st" ${f.star?'checked':''}></label></div>
 <p class="muted center" id="fcount" aria-live="polite"></p><button class="btn" id="fdone">Xong</button>`,route);
 const cnt=()=>$('#fcount').textContent=deck().length+' từ được chọn';cnt();
 $$('.chip',sh).forEach(b=>b.onclick=()=>{f[b.dataset.k]=b.dataset.v;$$(`.chip[data-k="${b.dataset.k}"]`,sh).forEach(x=>{x.classList.toggle('on',x==b);x.setAttribute('aria-pressed',x==b)});save();cnt();buzz(8)});
 $('#f-t1').onchange=e=>{f.task1=e.target.checked;save();cnt()};$('#f-st').onchange=e=>{f.star=e.target.checked;save();cnt()};$('#fdone').onclick=close;$('#fdone').focus()}
function openSettings(){const seg=(k,opts)=>`<div class="segc" role="radiogroup">${opts.map(([v,l])=>`<button role="radio" aria-checked="${S.set[k]==v}" class="${S.set[k]==v?'on':''}" data-set="${k}" data-v="${v}">${l}</button>`).join('')}</div>`;
 const {sh,close}=sheet(`<h2>Cài đặt</h2><div class="eyebrow">Phát âm</div><div class="group">
 <div class="opt-row"><span>Giọng đọc</span>${seg('voice',[['gb','Anh (UK)'],['us','Mỹ (US)']])}</div>
 <div class="opt-row"><span>Tốc độ mặc định</span>${seg('slow',[['false','Bình thường'],['true','Chậm']])}</div>
 <label class="opt-row"><span>Tự phát âm khi hiện thẻ</span><input class="sw" type="checkbox" data-sw="autoplay" ${S.set.autoplay?'checked':''}></label>
 <div class="opt-row"><span>Tải âm thanh để học offline<br><small class="muted" id="dlst">Âm thanh được lưu dần khi bạn nghe</small></span><button class="btn sm sec" id="dl">${I('download','s')}Tải</button></div></div>
 <div class="eyebrow">Giao diện</div><div class="group"><div class="opt-row"><span>Chế độ</span>${seg('theme',[['system','Tự động'],['light','Sáng'],['dark','Tối']])}</div>
 <label class="opt-row"><span>Rung phản hồi</span><input class="sw" type="checkbox" data-sw="haptics" ${S.set.haptics?'checked':''}></label></div>
 <div class="eyebrow">Tài khoản trên máy này</div><div class="group"><button class="opt-row" style="width:100%;border:none;background:none;text-align:left" id="redo"><span>Đổi tên, mục tiêu, kiểu học</span>${I('chevron-right')}</button>
 <button class="opt-row" style="width:100%;border:none;background:none;text-align:left;color:var(--danger)" id="rst"><span>Xoá toàn bộ tiến độ</span>${I('rotate-ccw')}</button></div>
 <p class="muted center" style="margin-top:16px">Phiên bản 4 · Biểu tượng Lucide (ISC) · Giọng đọc Microsoft Neural</p>`,route);
 $$('[data-set]',sh).forEach(b=>b.onclick=()=>{const k=b.dataset.set;let v=b.dataset.v;if(k=='slow')v=v=='true';S.set[k]=v;save();$$(`[data-set="${k}"]`,sh).forEach(x=>{x.classList.toggle('on',x==b);x.setAttribute('aria-checked',x==b)});if(k=='theme')applyTheme();if(k=='voice'||k=='slow')play(words[2]);updVoice();buzz(8)});
 $$('[data-sw]',sh).forEach(x=>x.onchange=()=>{S.set[x.dataset.sw]=x.checked;save()});
 $('#redo').onclick=()=>{close();onboarding(0)};$('#rst').onclick=()=>{if(confirm('Xoá toàn bộ tiến độ trên thiết bị này?')){Object.assign(S,{srs:{},known:{},learn:{},speak:{},log:{},best:{}});save();FC=null;toast('Đã xoá tiến độ','rotate-ccw');close()}};
 $('#dl').onclick=async()=>{if(!('caches'in window)){toast('Trình duyệt không hỗ trợ lưu offline','info');return}const b=$('#dl');b.disabled=true;const c=await caches.open(AUDIO_CACHE);const urls=words.flatMap(w=>[aurl(w,'w'),aurl(w,'ex')]);let n=0;
  for(let i=0;i<urls.length;i+=8){await Promise.all(urls.slice(i,i+8).map(u=>c.match(u).then(m=>m||fetch(u).then(r=>r.ok&&c.put(u,r))).catch(()=>{})));n=Math.min(urls.length,i+8);const st=$('#dlst');if(st)st.textContent=`Đang tải ${n}/${urls.length}…`}
  const st=$('#dlst');if(st)st.textContent=`Đã lưu ${urls.length} tệp giọng ${S.set.voice=='gb'?'Anh':'Mỹ'}`;b.disabled=false;toast('Đã tải xong âm thanh','download')}}

/* ---------- onboarding ---------- */
function onboarding(step=0,draft={...(S.user||{})}){const N=4,seg=`<div class="seg" role="progressbar" aria-valuemin="1" aria-valuemax="${N}" aria-valuenow="${step+1}">${[...Array(N)].map((_,i)=>`<i class="${i<=step?'on':''}"></i>`).join('')}</div>`;
 const goals=[['10','10 từ mỗi ngày','Nhẹ nhàng, 5 phút','leaf'],['25','25 từ mỗi ngày','Vừa sức, khoảng 15 phút','target'],['50','50 từ mỗi ngày','Chăm chỉ, khoảng 30 phút','flame'],['all','Học hết toàn bộ','Không giới hạn mỗi ngày','repeat']];
 const styles=[['cards','Thẻ ghi nhớ','Lật thẻ, vuốt trái hoặc phải','layers'],['learn','Học từng vòng','Trắc nghiệm rồi gõ từ','brain'],['speak','Luyện nói','Nghe giọng chuẩn, nói theo, chấm điểm','mic'],['mix','Kết hợp','Mỗi ngày một kiểu','shuffle']];
 let html;const radio=(k,arr)=>`<div class="choice" role="radiogroup">${arr.map(([v,l,d,ic])=>`<button class="radio ${(draft[k]||arr[k=='goal'?1:0][0])==v?'on':''}" role="radio" aria-checked="${(draft[k]||arr[k=='goal'?1:0][0])==v}" data-${k}="${v}"><span class="ic">${I(ic=='leaf'?'sparkles':ic)}</span><span><b>${l}</b><small>${d}</small></span></button>`).join('')}</div>`;
 if(step==0)html=`${mascot('wave','Chào bạn, mình là Cú Bông.<br>Bạn tên là gì?')}<label class="sr" for="nm">Tên của bạn</label><input class="bigin" id="nm" placeholder="Tên của bạn" maxlength="24" autocomplete="given-name" value="${esc(draft.name||'')}"><div class="grow"></div>
  <button class="btn" id="nx">Tiếp tục</button><button class="btn sec" id="sk" style="margin-top:10px">Để sau</button>`;
 if(step==1)html=`${mascot('think',`Mỗi ngày ${esc(draft.name||'bạn')} muốn học bao nhiêu từ mới?`)}${radio('goal',goals)}<p class="muted center">Bạn vẫn có thể học hết toàn bộ bất cứ lúc nào.</p><div class="grow"></div><button class="btn" id="nx">Tiếp tục</button>`;
 if(step==2)html=`${mascot('idle','Bạn thích học theo kiểu nào?')}${radio('style',styles)}<div class="grow"></div><button class="btn" id="nx">Tiếp tục</button>`;
 if(step==3){const g=goals.find(x=>x[0]==(draft.goal||'25')),st=styles.find(x=>x[0]==(draft.style||'cards'));
  html=`${mascot('celebrate',`Kế hoạch của ${esc(draft.name||'bạn')} đã sẵn sàng`)}<div class="card plan" style="padding:4px 18px">
  <div class="li"><span class="ic">${I('target')}</span><div><b>${g[1]}</b><small>Giữ chuỗi ngày học để Cú Bông vui</small></div></div>
  <div class="li"><span class="ic">${I(st[3])}</span><div><b>${st[1]}</b><small>${st[2]}</small></div></div>
  <div class="li"><span class="ic">${I('headphones')}</span><div><b>${words.length} từ Oxford 3000 · IELTS</b><small>Giọng Anh và Mỹ, phát âm chậm, câu ví dụ</small></div></div></div>
  <p class="muted center">Tiến độ chỉ lưu trên thiết bị này.</p><div class="grow"></div><button class="btn pri" id="nx">Bắt đầu</button>`}
 view('',`<div class="ob">${seg}${html}</div>`,step>0);$('#back').onclick=()=>onboarding(step-1,draft);
 if(step==0){const nm=$('#nm');nm.onkeydown=e=>{if(e.key=='Enter')$('#nx').click()};$('#nx').onclick=()=>{draft.name=nm.value.trim();onboarding(1,draft)};$('#sk').onclick=()=>{draft.name='';onboarding(1,draft)}}
 if(step==1){$$('[data-goal]').forEach(b=>b.onclick=()=>{draft.goal=b.dataset.goal;buzz(8);onboarding(1,draft)});$('#nx').onclick=()=>{draft.goal=draft.goal||'25';onboarding(2,draft)}}
 if(step==2){$$('[data-style]').forEach(b=>b.onclick=()=>{draft.style=b.dataset.style;buzz(8);onboarding(2,draft)});$('#nx').onclick=()=>{draft.style=draft.style||'cards';onboarding(3,draft)}}
 if(step==3)$('#nx').onclick=()=>{S.user={...draft,done:true,since:S.user?.since||today()};save();confetti();location.hash='#/';route()}}

/* ---------- home ---------- */
const MODES={cards:['layers','Thẻ ghi nhớ','Lật, vuốt phải “đã biết”, trái “đang học”. Học hết toàn bộ.'],learn:['brain','Học','Từng vòng: trắc nghiệm rồi gõ từ'],
 speak:['mic','Luyện nói','Nói theo giọng chuẩn, chấm điểm'],listen:['headphones','Nghe – chép','Nghe từ rồi gõ lại'],review:['calendar-clock','Ôn theo lịch',''],
 match:['zap','Ghép thẻ',''],test:['clipboard-check','Kiểm tra','20 câu hỗn hợp, chấm điểm'],list:['list-checks','Danh sách từ',''],stats:['chart-column','Thống kê','Tiến độ theo cấp độ']};
function home(){const d=deck(),now=Date.now(),learned=d.filter(w=>S.srs[w.id]&&S.srs[w.id].reps).length,due=d.filter(w=>S.srs[w.id]&&S.srs[w.id].due<=now).length;
 let streak=0;for(let x=new Date();S.log[ymd(x)];x=new Date(x-DAY))streak++;if(!S.log[today()]){for(let x=new Date(now-DAY);S.log[ymd(x)];x=new Date(x-DAY))streak++}
 const tl=S.log[today()]||{rev:0,new:0},g=newPerDay(),gl=g>=1e9?'∞':g,gp=g>=1e9?(tl.new?100:0):Math.min(100,tl.new/g*100);
 const hr=new Date().getHours(),hi=hr<11?'Chào buổi sáng':hr<18?'Chào buổi chiều':'Chào buổi tối';
 let st='wave',msg=`${hi}, ${esc(uname())}.<br>Hôm nay mình học ${g>=1e9?'hết toàn bộ':g+' từ'} nhé?`;
 if(!tl.rev&&streak>0){st='sleepy';msg=`Cú Bông buồn ngủ quá… Học vài từ để giữ chuỗi ${streak} ngày nhé.`}
 else if(g<1e9&&tl.new>=g){st='happy';msg=`Xong mục tiêu hôm nay. Giỏi lắm, ${esc(uname())}!`}
 if(!d.length){st='meditate';msg='Bộ từ đang trống. Hãy đổi bộ lọc nhé.'}
 const style=(S.user&&S.user.style)||'cards',main=style=='mix'?['cards','learn','speak','listen'][new Date().getDate()%4]:style;
 MODES.review[2]=`${due} thẻ cần ôn · ${gl} từ mới/ngày`;MODES.match[2]=S.best.match?`Kỷ lục ${(S.best.match/1000).toFixed(1)} giây`:'Ghép nhanh nhất có thể';MODES.list[2]=`Tìm, nghe, gắn sao (${Object.keys(S.star).length})`;
 const M=k=>`<button class="mode ${k==main?'hero':''}" data-go="${k}"><span class="ic">${I(MODES[k][0])}</span><span><b>${MODES[k][1]}</b><br><small>${MODES[k][2]}</small></span>${k==main?`<span class="go">${I('chevron-right','l')}</span>`:''}</button>`;
 view('',`${mascot(st,msg)}
 <section class="card today" aria-label="Hôm nay"><div class="top"><b>Hôm nay</b><span class="streak">${I('flame','s')}${streak} ngày</span></div>
 <div class="top" style="margin:6px 0 10px"><span class="num">${tl.new}<span class="muted" style="font-size:15px;font-weight:500"> / ${gl} từ mới</span></span><span class="muted">${tl.rev} lượt ôn</span></div>
 <div class="bar" role="progressbar" aria-label="Mục tiêu hôm nay" aria-valuenow="${Math.round(gp)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${gp}%"></i></div>
 <div class="kpis"><div><b>${learned}</b>đã học</div><div><b>${due}</b>cần ôn</div><div><b>${d.length}</b>${esc(deckName())}</div></div></section>
 <div class="chips"><button class="chip on" id="filt">${I('sliders-horizontal','s')}Chọn bộ từ</button>${[...new Set(words.flatMap(w=>w.tags.filter(t=>/^day/.test(t))))].sort().map(x=>`<button class="chip ${F().day==x?'on':''}" data-day="${x}" aria-pressed="${F().day==x}">Ngày ${+x.slice(3)}</button>`).join('')}</div>
 <div class="modes">${M(main)}${Object.keys(MODES).filter(k=>k!=main).map(M).join('')}</div>
 <p class="muted center" style="margin-top:20px">Tiến độ lưu riêng trên thiết bị này. Thêm vào màn hình chính để học cả khi offline.</p>`,false);
 $('#filt').onclick=openFilter;$$('[data-day]').forEach(b=>b.onclick=()=>{F().day=F().day==b.dataset.day?'':b.dataset.day;save();home();buzz(8)});
 $$('[data-go]').forEach(b=>b.onclick=()=>{if(!deck().length&&b.dataset.go!='stats'){toast('Bộ từ đang trống, hãy đổi bộ lọc','info');return}location.hash='#/'+b.dataset.go})}

/* ---------- swipeable card ---------- */
function makeCard(stage,w,dir,onSwipe){const el=document.createElement('div');el.className='fc';el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label','Thẻ '+(dir=='en'?w.w:w.vi)+'. Chạm để lật');
 el.innerHTML=`<div class="inner"><div class="face f">${frontFace(w,dir)}</div><div class="face b">${backFace(w)}</div></div><span class="lbl L">${I('x','s')}Đang học</span><span class="lbl K">${I('check','s')}Đã biết</span>`;
 stage.appendChild(el);let sx=0,sy=0,dx=0,t0=0,drag=false,moved=false;const L=$('.lbl.L',el),K=$('.lbl.K',el);
 const flip=()=>{el.classList.toggle('flip');buzz(6);if(el.classList.contains('flip')&&dir=='vi'&&S.set.autoplay)play(w);if(el._onflip)el._onflip()};
 el.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;drag=true;moved=false;sx=e.clientX;sy=e.clientY;dx=0;t0=performance.now();el.style.transition='none';el.setPointerCapture(e.pointerId)});
 el.addEventListener('pointermove',e=>{if(!drag)return;dx=e.clientX-sx;const dy=e.clientY-sy;if(Math.abs(dx)>8)moved=true;if(!moved)return;
  el.style.transform=`translate3d(${dx}px,${dy*.12}px,0) rotate(${dx/20}deg)`;const o=Math.min(1,Math.abs(dx)/100);L.style.opacity=dx<0?o:0;K.style.opacity=dx>0?o:0});
 const end=()=>{if(!drag)return;drag=false;if(!moved){flip();return}const v=Math.abs(dx)/(performance.now()-t0);
  if(Math.abs(dx)>100||v>.6)fling(dx>0);else{el.style.transition='transform 480ms var(--ease-spring)';el.style.transform='';L.style.opacity=K.style.opacity=0}};
 el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
 function fling(right){buzz(12);el.style.transition='transform 320ms var(--ease),opacity 320ms';el.style.transform=`translate3d(${(right?1:-1)*innerWidth*1.2}px,30px,0) rotate(${right?22:-22}deg)`;el.style.opacity=0;(right?K:L).style.opacity=1;setTimeout(()=>{el.remove();onSwipe(right)},reduce?0:240)}
 el.addEventListener('keydown',e=>{if(e.key==' '||e.key=='Enter'){e.preventDefault();flip()}});return {el,flip,fling}}

/* ---------- flashcards ---------- */
let FC=null,keys=null;document.addEventListener('keydown',e=>keys&&keys(e));
function cards(){const d=deck();if(!FC||FC.sig!=JSON.stringify(F()))FC={sig:JSON.stringify(F()),queue:d.map(w=>w.id),i:0,know:0,learn:0,hist:[],shuffled:false};render();
 function render(){const total=FC.queue.length;if(FC.i>=total)return done();const w=byId(FC.queue[FC.i]);
  view('Thẻ ghi nhớ',`${mascot(FC.mood||(FC.i==0?'wave':'idle'),FC.tip||'Chạm để lật. Vuốt phải nếu đã biết.',{small:true,row:true})}
  <div class="prog"><span class="count l" aria-label="Đang học ${FC.learn}">${FC.learn}</span><div class="bar" role="progressbar" aria-valuenow="${FC.i}" aria-valuemax="${total}"><i style="width:${FC.i/total*100}%"></i></div><span class="count k" aria-label="Đã biết ${FC.know}">${FC.know}</span></div>
  <div class="stage" id="stage"></div>
  <div class="yn"><button class="btn l" id="nL">${I('x')}Đang học</button><button class="btn k" id="nK">${I('check')}Đã biết</button></div>
  <div class="ctrl"><button class="ib" id="undo" aria-label="Hoàn tác" ${FC.hist.length?'':'disabled'}>${I('undo-2')}</button><button class="ib ${FC.shuffled?'on':''}" id="shuf" aria-label="Trộn thẻ" aria-pressed="${FC.shuffled}">${I('shuffle')}</button>
  <button class="ib" id="flipb" aria-label="Lật thẻ">${I('refresh-cw')}</button><button class="ib ${S.set.dir=='vi'?'on':''}" id="dirb" aria-label="Đổi chiều Anh – Việt">${I('languages')}</button><button class="ib ${S.set.autoplay?'on':''}" id="autob" aria-label="Tự phát âm" aria-pressed="${S.set.autoplay}">${I(S.set.autoplay?'volume-2':'volume-x')}</button></div>
  <p class="hint">${FC.i+1} / ${total} · Phím ← → để vuốt, phím cách để lật</p>`);
  if(FC.mood){const m=$('.mascot');setTimeout(()=>moodTo(m,'idle'),1300);FC.mood=null}
  const c=makeCard($('#stage'),w,S.set.dir,right=>{FC.tip=right?['Tuyệt, đã biết!','Nhớ tốt lắm!','Giỏi quá!'][Math.random()*3|0]:'Không sao, mình sẽ gặp lại từ này.';FC.mood=right?'happy':'sad';FC.hist.push({id:w.id,right});right?FC.know++:FC.learn++;grade(w,right?4:0);if(!right)FC.queue.push(w.id);FC.i++;render()});
  if(S.set.dir=='en'&&S.set.autoplay)play(w);
  $('#nL').onclick=()=>c.fling(false);$('#nK').onclick=()=>c.fling(true);$('#flipb').onclick=c.flip;
  $('#undo').onclick=()=>{const h=FC.hist.pop();if(!h)return;FC.i--;h.right?FC.know--:FC.learn--;if(!h.right)FC.queue.pop();FC.tip='Đã hoàn tác';render()};
  $('#shuf').onclick=()=>{FC.shuffled=!FC.shuffled;const rest=FC.queue.slice(FC.i);FC.queue=FC.queue.slice(0,FC.i).concat(FC.shuffled?shuffle(rest):rest.sort((a,b)=>a.localeCompare(b)));toast(FC.shuffled?'Đã trộn thẻ':'Theo thứ tự','shuffle');render()};
  $('#dirb').onclick=()=>{S.set.dir=S.set.dir=='en'?'vi':'en';save();render()};$('#autob').onclick=()=>{S.set.autoplay=!S.set.autoplay;save();render()};
  keys=e=>{if(e.target.tagName=='INPUT')return;if(e.key=='ArrowRight')c.fling(true);else if(e.key=='ArrowLeft')c.fling(false);else if(e.key==' '){e.preventDefault();c.flip()}}}
 function done(){confetti();view('Thẻ ghi nhớ',`<div class="res">${mascot('celebrate','Bạn đã đi hết bộ thẻ!')}<p class="muted">${FC.know} lần “đã biết” · ${FC.learn} lần “đang học”</p>
  <div class="row"><button class="btn sec" id="again">Bắt đầu lại</button><button class="btn" id="learnm">Chế độ Học</button></div></div>`);
  $('#again').onclick=()=>{FC=null;cards()};$('#learnm').onclick=()=>location.hash='#/learn'}}

/* ---------- SRS review ---------- */
function review(){const d=deck(),now=Date.now(),due=d.filter(w=>S.srs[w.id]&&S.srs[w.id].due<=now).sort((a,b)=>S.srs[a.id].due-S.srs[b.id].due);
 const left=Math.max(0,newPerDay()-((S.log[today()]||{}).new||0));let q=due.concat(d.filter(w=>!S.srs[w.id]).slice(0,left)),n=0;const tot=q.length;
 (function nx(){const w=q.shift();if(!w){if(n)confetti();view('Ôn theo lịch',`<div class="res">${mascot(n?'celebrate':'meditate',n?'Xong lượt ôn hôm nay!':'Chưa có thẻ nào cần ôn. Thư giãn chút nhé.')}<p class="muted">Muốn học thêm? “Thẻ ghi nhớ” cho phép học hết toàn bộ, không giới hạn.</p><button class="btn" onclick="location.hash='#/cards'">Học hết toàn bộ</button></div>`);return}
  const st=S.srs[w.id];const b=[0,3,4,5].map(g=>[g,ivl(g<3?0:sm2(st,g).int)]);
  view('Ôn theo lịch',`<div class="prog"><div class="bar"><i style="width:${n/tot*100}%"></i></div><span>${tot-n}</span></div><div class="stage" id="stage"></div>
  <div class="yn hidden" id="gr" style="grid-template-columns:repeat(4,1fr);gap:8px">${b.map(([g,t],i)=>`<button class="btn sm sec" style="width:100%;flex-direction:column;gap:0;min-height:56px;padding:0 4px" data-g="${g}"><span style="color:${['var(--danger)','var(--warn)','var(--success)','var(--primary)'][i]}">${['Quên','Khó','Nhớ','Dễ'][i]}</span><small class="muted">${t}</small></button>`).join('')}</div>
  <button class="btn" id="show" style="margin-top:12px">Hiện đáp án</button><p class="hint">Vuốt phải = Nhớ · trái = Quên · phím 1–4</p>`);
  const c=makeCard($('#stage'),w,S.set.dir,right=>{grade(w,right?4:0);if(!right)q.splice(Math.min(3,q.length),0,w);n++;nx()});
  const reveal=()=>{if(!c.el.classList.contains('flip'))c.flip();$('#gr').classList.remove('hidden');$('#show').classList.add('hidden')};c.el._onflip=()=>{$('#gr').classList.remove('hidden');$('#show').classList.add('hidden')};
  $('#show').onclick=reveal;$$('[data-g]').forEach(x=>x.onclick=()=>{const g=+x.dataset.g;grade(w,g);if(g<3)q.splice(Math.min(3,q.length),0,w);n++;buzz(8);nx()});
  if(S.set.dir=='en'&&S.set.autoplay)play(w);
  keys=e=>{if(e.key==' '){e.preventDefault();reveal()}else if('1234'.includes(e.key)&&!$('#gr').classList.contains('hidden'))$$('[data-g]')[e.key-1].click()}})()}

/* ---------- Learn ---------- */
const PRAISE=['Chính xác!','Tuyệt vời!','Giỏi lắm!','Quá chuẩn!'];
function learn(){const d=deck(),ROUND=7;let round=[],ri=0,rc=0;const lv=w=>S.learn[w.id]||0;
 function start(){const pend=d.filter(w=>lv(w)<2);if(!pend.length)return finished();round=shuffle(shuffle(pend.filter(w=>S.learn[w.id]!=null)).concat(shuffle(pend.filter(w=>S.learn[w.id]==null)).slice(0,ROUND)).slice(0,ROUND));ri=0;rc=0;ask()}
 function header(){const m=d.filter(w=>lv(w)>=2).length,f=d.filter(w=>lv(w)==1).length;
  return `${mascot('think',['Từ này nghĩa là gì nhỉ?','Bình tĩnh suy nghĩ nhé.','Bạn làm được mà!'][ri%3],{small:true,row:true})}<div class="prog"><div class="bar" role="progressbar" aria-valuenow="${m}" aria-valuemax="${d.length}"><i style="width:${(m+f*.5)/d.length*100}%"></i></div><span>${m}/${d.length}</span></div><p class="muted">Câu ${ri+1}/${round.length} trong vòng · ${f} từ đang quen dần</p>`}
 function ask(){if(ri>=round.length)return roundEnd();const w=round[ri],typing=lv(w)>=1,en=Math.random()<.5;
  if(!typing){const pool=shuffle(words.filter(x=>x.id!=w.id&&x.pos.split(',')[0]==w.pos.split(',')[0])).concat(shuffle(words.filter(x=>x.id!=w.id)));const opts=shuffle([w,...pool.filter((x,i,a)=>a.indexOf(x)==i).slice(0,3)]);
   view('Học',header()+`<div class="card q"><div class="kind">${en?'Thuật ngữ':'Định nghĩa'}</div><div class="term">${esc(en?w.w:w.vi)}</div>${en?`<div class="audiobar" style="justify-content:flex-start;margin:-8px 0 12px">${auBtns(w,false)}</div>`:''}
   <div class="kind" style="margin-bottom:8px">Chọn đáp án đúng</div><div class="opts">${opts.map((o,i)=>`<button class="opt" data-id="${o.id}"><span class="n">${i+1}</span>${esc(en?o.vi:o.w)}</button>`).join('')}</div><div id="fb" aria-live="polite"></div></div>`);
   if(en&&S.set.autoplay)play(w);
   const pick=b=>{if($('.opt[disabled]'))return;const ok=b.dataset.id==w.id;$$('.opt').forEach(x=>{x.disabled=true;if(x.dataset.id==w.id)x.classList.add('ok')});if(!ok)b.classList.add('bad');res(w,ok,1)};
   $$('.opt').forEach(b=>b.onclick=()=>pick(b));keys=e=>{if('1234'.includes(e.key)&&$$('.opt')[e.key-1])pick($$('.opt')[e.key-1])}}
  else{view('Học',header()+`<div class="card q"><div class="kind">Định nghĩa</div><div class="term">${esc(w.vi)}</div><div class="tags" style="justify-content:flex-start;margin:-8px 0 16px"><span class="tag">${esc(w.pos)}</span></div>
   <label class="kind" for="ti" style="display:block;margin-bottom:8px">Gõ từ tiếng Anh</label><input class="ti" id="ti" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done">
   <div class="row" id="tirow"><button class="btn sec" id="dk">Không biết</button><button class="btn" id="ck">Kiểm tra</button></div><div id="fb" aria-live="polite"></div></div>`);
   const ti=$('#ti');setTimeout(()=>ti.focus(),60);
   const chk=give=>{if(ti.disabled)return;const ok=!give&&accepts(w).includes(norm(ti.value));ti.disabled=true;ti.classList.add(ok?'ok':'bad');$('#tirow').remove();res(w,ok,2)};
   $('#ck').onclick=()=>chk(false);$('#dk').onclick=()=>chk(true);ti.onkeydown=e=>{if(e.key=='Enter')chk(false)};keys=null}}
 function res(w,ok,to){if(ok){S.learn[w.id]=Math.max(lv(w),to);rc++;buzz(10);grade(w,4)}else{S.learn[w.id]=0;buzz([30,40,30]);grade(w,0)}save();play(w);
  moodTo($('.mascot'),ok?'happy':'sad',ok?PRAISE[Math.random()*PRAISE.length|0]:'Chưa đúng, xem lại nhé.');
  $('#fb').innerHTML=`<div class="fb ${ok?'ok':'bad'}">${I(ok?'circle-check':'circle-x')}<div>${ok?'':'Đáp án: '}<b>${esc(w.w)}</b> ${esc(w.ipa)}<br><span style="font-weight:500">${esc(w.vi)}</span></div></div>${ok?'':`<p class="muted"><i>${esc(w.ex)}</i></p>`}<button class="btn" id="nx" style="margin-top:12px">Tiếp tục</button>`;
  const go=()=>{ri++;ask()};$('#nx').onclick=go;$('#nx').focus({preventScroll:true});keys=e=>{if(e.key=='Enter'){e.preventDefault();go()}}}
 function roundEnd(){confetti();const m=d.filter(w=>lv(w)>=2).length;
  view('Học',`<div class="res">${mascot('celebrate','Hoàn thành vòng!')}<p class="muted">Đúng ${rc}/${round.length} câu · đã thuộc ${m}/${d.length} từ</p></div>
  <div class="list">${round.map(w=>`<div class="it"><div><b>${esc(w.w)}</b> <span class="muted">${esc(w.vi)}</span></div><span class="tag" style="background:${lv(w)>=2?'var(--success-soft);color:var(--success)':lv(w)==1?'var(--warn-soft);color:var(--warn)':'var(--danger-soft);color:var(--danger)'}">${lv(w)>=2?'Đã thuộc':lv(w)==1?'Đang quen':'Cần ôn'}</span></div>`).join('')}</div><button class="btn" id="nr" style="margin-top:12px">Vòng tiếp theo</button>`);
  $('#nr').onclick=start;$('#nr').focus();keys=e=>{if(e.key=='Enter')start()}}
 function finished(){confetti();view('Học',`<div class="res">${mascot('celebrate',`Bạn đã thuộc cả ${d.length} từ!`)}<p class="muted">Hãy làm bài kiểm tra, hoặc học lại từ đầu.</p>
  <div class="row"><button class="btn sec" id="rs">Học lại từ đầu</button><button class="btn" onclick="location.hash='#/test'">Kiểm tra</button></div></div>`);$('#rs').onclick=()=>{d.forEach(w=>delete S.learn[w.id]);save();start()}}
 start()}

/* ---------- Speaking ---------- */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const isIOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform=='MacIntel'&&navigator.maxTouchPoints>1);
const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
function lev(a,b){const m=a.length,n=b.length,d=Array.from({length:m+1},(_,i)=>[i]);for(let j=1;j<=n;j++)d[0][j]=j;
 for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]==b[j-1]?0:1));return d[m][n]}
function speechScore(w,alts){const targets=accepts(w);let best=0,heard=alts[0]||'';
 for(const a of alts){const h=norm(a);for(const t of targets){let s;if(h==t||h.split(' ').includes(t)||(t.includes(' ')&&h.includes(t)))s=1;else{const toks=[h,...h.split(' ')];s=Math.max(...toks.map(x=>1-lev(x,t)/Math.max(x.length,t.length,1)))}if(s>best){best=s;heard=a}}}
 return {score:Math.round(best*100),heard}}
function speak(){const d=deck();let q=shuffle(d),i=0,rec=null,mrec=null,chunks=[],myUrl=null;
 const support=SR&&!(isIOS&&standalone);
 function note(){if(support)return '';return `<div class="note" role="note">${I('info')}<div><b>Thiết bị này chưa hỗ trợ chấm phát âm tự động.</b> ${isIOS?(standalone?'Trên iPhone, khi mở từ màn hình chính, Apple chưa cho phép nhận dạng giọng nói. Hãy mở trang bằng Safari để được chấm điểm (iOS 14.5 trở lên).':'Hãy cập nhật iOS 14.5 trở lên và cho phép Safari dùng micro.'):'Hãy dùng Chrome hoặc Edge (Android, máy tính) hoặc Safari.'} Bạn vẫn có thể ghi âm giọng mình và so sánh với giọng chuẩn.</div></div>`}
 function show(){const w=q[i%q.length],best=S.speak[w.id];
  view('Luyện nói',`${mascot('idle',best!=null?`Điểm cao nhất của từ này: ${best}`:'Nghe mẫu, rồi bấm micro và đọc to.',{small:true,row:true})}${note()}
  <div class="card q center" style="margin-top:12px"><div class="kind">Từ ${i+1} / ${q.length}</div><div class="w" style="margin-top:6px">${esc(w.w)}</div><div class="ipa">${esc(w.ipa)}</div>
  <div class="tags"><span class="tag">${esc(w.pos)}</span><span class="tag lv">${esc(w.lv)}</span></div><p class="muted" style="margin:8px 0 0">${esc(w.vi)}</p>
  <div class="audiobar">${auBtns(w)}</div>
  <button class="mic" id="mic" aria-label="${support?'Bấm để nói':'Bấm để ghi âm'}">${I('mic','xl')}</button><p class="muted" id="mst" aria-live="polite">${support?'Bấm micro và đọc to từ trên':'Bấm để ghi âm, bấm lần nữa để dừng'}</p>
  <div id="sres"></div></div>
  <div class="row"><button class="btn sec" id="prev" ${i?'':'disabled'}>Từ trước</button><button class="btn" id="next">Từ tiếp theo</button></div>
  <p class="hint">Ví dụ: <i>${esc(w.ex)}</i></p>`);
  play(w);$('#next').onclick=()=>{stop();i++;show()};$('#prev').onclick=()=>{stop();i--;show()};$('#mic').onclick=()=>support?listenSR(w):record(w)}
 function stop(){try{rec&&rec.abort()}catch(e){}rec=null;try{mrec&&mrec.state=='recording'&&mrec.stop()}catch(e){}}
 function listenSR(w){const mic=$('#mic'),st=$('#mst');if(rec){rec.stop();return}audio.pause();
  rec=new SR();rec.lang=S.set.voice=='us'?'en-US':'en-GB';rec.interimResults=false;rec.maxAlternatives=5;rec.continuous=false;
  mic.classList.add('rec');st.textContent='Đang nghe… hãy đọc to';moodTo($('.mascot'),'listen');buzz(10);let got=false;
  rec.onresult=e=>{got=true;const alts=[...e.results[0]].map(a=>a.transcript);const {score,heard}=speechScore(w,alts);showScore(w,score,heard)};
  rec.onerror=e=>{const m={'not-allowed':'Bạn chưa cho phép dùng micro. Hãy bật quyền micro cho trang này.','service-not-allowed':'Trình duyệt chặn nhận dạng giọng nói.','no-speech':'Chưa nghe thấy gì, thử lại nhé.','network':'Cần kết nối mạng để chấm phát âm.','audio-capture':'Không tìm thấy micro.'}[e.error]||'Có lỗi nhận dạng, thử lại nhé.';st.textContent=m;moodTo($('.mascot'),'sad',m,1800)};
  rec.onend=()=>{mic.classList.remove('rec');rec=null;if(!got&&st.textContent.startsWith('Đang'))st.textContent='Chưa nghe rõ, thử lại nhé.'};
  try{rec.start()}catch(e){mic.classList.remove('rec');rec=null;st.textContent='Không khởi động được micro.'}}
 function showScore(w,score,heard){const prev=S.speak[w.id]||0;S.speak[w.id]=Math.max(prev,score);logIt(false);save();
  const c=score>=85?'var(--success)':score>=60?'var(--warn)':'var(--danger)';const msg=score>=85?'Phát âm rất chuẩn!':score>=60?'Khá tốt, thử nói rõ hơn nhé.':'Nghe mẫu chậm rồi thử lại nhé.';
  $('#mst').textContent='';$('#sres').innerHTML=`<div class="score" style="--p:${score};--c:${c}" role="img" aria-label="Điểm ${score}"><b>${score}</b></div><p style="margin:0">Cú Bông nghe được: <b>“${esc(heard)}”</b></p><p class="muted">${msg}</p>`;
  moodTo($('.mascot'),score>=85?'happy':score>=60?'idle':'sad',msg);if(score>=85){buzz([10,30,10]);if(score==100&&prev<100)confetti()}else buzz([30,40,30])}
 async function record(w){const mic=$('#mic'),st=$('#mst');if(mrec&&mrec.state=='recording'){mrec.stop();return}
  if(!navigator.mediaDevices||!window.MediaRecorder){st.textContent='Thiết bị này không hỗ trợ ghi âm. Hãy nghe mẫu và đọc theo thành tiếng.';return}
  try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});chunks=[];mrec=new MediaRecorder(stream);mrec.ondataavailable=e=>chunks.push(e.data);
   mrec.onstop=()=>{stream.getTracks().forEach(t=>t.stop());mic.classList.remove('rec');if(myUrl)URL.revokeObjectURL(myUrl);myUrl=URL.createObjectURL(new Blob(chunks,{type:mrec.mimeType}));st.textContent='';
    $('#sres').innerHTML=`<div class="row"><button class="btn sec" id="mine">${I('play','s')}Giọng của bạn</button><button class="btn sec" data-au="${w.id}" data-k="w">${I('volume-2','s')}Giọng chuẩn</button></div><p class="muted">Tự đánh giá:</p><div class="row" style="margin-top:0"><button class="btn sec" id="sa0">Chưa giống</button><button class="btn" id="sa1">Đã giống</button></div>`;
    $('#mine').onclick=()=>{audio.pause();const a=new Audio(myUrl);a.play()};$('#sa0').onclick=()=>{S.speak[w.id]=Math.max(S.speak[w.id]||0,50);save();moodTo($('.mascot'),'idle','Nghe chậm rồi thử lại nhé.')};$('#sa1').onclick=()=>{S.speak[w.id]=Math.max(S.speak[w.id]||0,90);save();moodTo($('.mascot'),'happy','Tuyệt vời!');buzz(10)}};
   mrec.start();mic.classList.add('rec');st.textContent='Đang ghi âm… bấm lần nữa để dừng';}catch(e){st.textContent='Bạn chưa cho phép dùng micro.'}}
 show();keys=e=>{if(e.target.tagName=='INPUT')return;if(e.key==' '){e.preventDefault();$('#mic').click()}else if(e.key=='ArrowRight')$('#next').click()};
 return stop}

/* ---------- Listening / dictation ---------- */
function listen(){const d=deck(),N=Math.min(10,d.length),qs=shuffle(d).slice(0,N);let i=0,sc=0;const wrong=[];
 function ask(){if(i>=N)return end();const w=qs[i];const t=answerText(w).split(/,\s*/)[0];
  view('Nghe – chép',`${mascot('listen','Nghe kỹ rồi gõ lại từ bạn nghe được.',{small:true,row:true})}<div class="prog"><div class="bar"><i style="width:${i/N*100}%"></i></div><span>${i+1}/${N}</span></div>
  <div class="card q center"><button class="mic" id="pl" aria-label="Nghe lại">${I('volume-2','xl')}</button>
  <div class="audiobar"><button class="btn sm sec" data-au="${w.id}" data-k="w" data-slow="1">${I('turtle','s')}Chậm</button><button class="btn sm sec" id="hint">${I('lightbulb','s')}Gợi ý</button></div>
  <div class="slots" id="slots" aria-hidden="true"></div><label class="sr" for="ti">Từ bạn nghe được</label><input class="ti" id="ti" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Gõ từ bạn nghe được" enterkeyhint="done" style="margin-top:12px">
  <div class="row" id="tirow"><button class="btn sec" id="dk">Không biết</button><button class="btn" id="ck">Kiểm tra</button></div><div id="fb" aria-live="polite"></div></div>`);
  const pl=$('#pl');pl.onclick=()=>play(w,'w',{btn:pl});setTimeout(()=>play(w,'w',{btn:pl}),250);let hints=0;
  $('#hint').onclick=()=>{hints++;$('#slots').textContent=t.split('').map((c,k)=>c==' '?' ':k<hints?c:'_').join('');buzz(6)};
  const ti=$('#ti');setTimeout(()=>ti.focus(),80);
  const chk=give=>{if(ti.disabled)return;const ok=!give&&accepts(w).includes(norm(ti.value));ti.disabled=true;ti.classList.add(ok?'ok':'bad');$('#tirow').remove();if(ok)sc++;else wrong.push(w);grade(w,ok?(hints?3:4):0);
   moodTo($('.mascot'),ok?'happy':'sad',ok?PRAISE[Math.random()*PRAISE.length|0]:'Chưa đúng, nghe lại nhé.');buzz(ok?10:[30,40,30]);
   $('#fb').innerHTML=`<div class="fb ${ok?'ok':'bad'}" style="text-align:left">${I(ok?'circle-check':'circle-x')}<div><b>${esc(w.w)}</b> ${esc(w.ipa)}<br><span style="font-weight:500">${esc(w.vi)}</span></div></div><div class="audiobar">${auBtns(w)}</div><button class="btn" id="nx" style="margin-top:12px">Tiếp tục</button>`;
   const go=()=>{i++;ask()};$('#nx').onclick=go;$('#nx').focus({preventScroll:true});keys=e=>{if(e.key=='Enter'){e.preventDefault();go()}}};
  $('#ck').onclick=()=>chk(false);$('#dk').onclick=()=>chk(true);ti.onkeydown=e=>{if(e.key=='Enter')chk(false)};keys=null}
 function end(){const p=Math.round(sc/N*100);if(p>=80)confetti();
  view('Nghe – chép',`<div class="res">${mascot(p>=80?'celebrate':p>=50?'happy':'sad',p>=80?'Tai nghe rất tốt!':p>=50?'Khá lắm, luyện thêm nhé.':'Nghe chậm vài lần rồi thử lại nhé.')}<div class="big">${sc}/${N}</div></div>
  ${wrong.length?`<h3>Cần nghe lại</h3><div class="list">${wrong.map(w=>`<div class="it"><div><b>${esc(w.w)}</b> <span class="muted">${esc(w.ipa)}</span><br><span class="muted">${esc(w.vi)}</span></div>${auBtns(w,false)}</div>`).join('')}</div>`:''}
  <div class="row"><button class="btn sec" onclick="location.hash='#/'">Trang chủ</button><button class="btn" id="ag">Làm lượt mới</button></div>`);$('#ag').onclick=listen}
 ask()}

/* ---------- Match ---------- */
function match(){const d=deck();if(d.length<3){toast('Cần ít nhất 3 từ','info');return home()}const N=Math.min(6,d.length);
 function intro(){view('Ghép thẻ',`<div class="res">${mascot('idle','Sẵn sàng chưa?')}<p class="muted">Ghép ${N} cặp từ tiếng Anh với nghĩa tiếng Việt nhanh nhất có thể. Ghép sai bị cộng 1 giây.</p>${S.best.match?`<p><span class="streak" style="color:var(--primary);background:var(--primary-soft)">${I('trophy','s')}Kỷ lục ${(S.best.match/1000).toFixed(1)} giây</span></p>`:''}<button class="btn pri" id="go">Bắt đầu</button></div>`);$('#go').onclick=game;$('#go').focus()}
 function game(){const ps=shuffle(d).slice(0,N),tiles=shuffle(ps.flatMap(w=>[{id:w.id,t:w.w,k:'en'},{id:w.id,t:w.vi,k:'vi'}]));let sel=null,left=N,pen=0,raf;const t0=performance.now();
  view('Ghép thẻ',`<div class="timer">${I('zap')}<span id="tm">0.0</span> giây</div><div class="mgrid">${tiles.map((x,i)=>`<button class="tile" data-i="${i}" lang="${x.k}">${esc(x.t)}</button>`).join('')}</div>`);
  const tick=()=>{const e=$('#tm');if(!e)return;e.textContent=((performance.now()-t0)/1000+pen).toFixed(1);raf=requestAnimationFrame(tick)};tick();
  $$('.tile').forEach(b=>b.onclick=()=>{const x=tiles[b.dataset.i];if(!sel){sel=b;b.classList.add('sel');buzz(5);return}if(sel==b){b.classList.remove('sel');sel=null;return}
   const y=tiles[sel.dataset.i];if(x.id==y.id&&x.k!=y.k){b.classList.add('ok');sel.classList.add('ok');buzz(10);play(byId(x.id));sel=null;if(--left==0){cancelAnimationFrame(raf);finish(performance.now()-t0+pen*1000)}}
   else{const s=sel;[s,b].forEach(z=>{z.classList.remove('sel');z.classList.add('bad')});pen++;buzz([30,40,30]);setTimeout(()=>[s,b].forEach(z=>z.classList.remove('bad')),400);sel=null}})}
 function finish(ms){const rec=!S.best.match||ms<S.best.match;if(rec)S.best.match=Math.round(ms);save();confetti();
  view('Ghép thẻ',`<div class="res">${mascot('celebrate',rec?'Kỷ lục mới!':'Xong rồi, nhanh quá!')}<div class="big">${(ms/1000).toFixed(1)}s</div><p class="muted">${rec?'Bạn vừa lập kỷ lục mới':'Kỷ lục của bạn: '+(S.best.match/1000).toFixed(1)+' giây'}</p><div class="row"><button class="btn sec" onclick="location.hash='#/'">Trang chủ</button><button class="btn" id="pa">Chơi lại</button></div></div>`);$('#pa').onclick=game}
 intro()}

/* ---------- Test ---------- */
function test(){const d=deck();if(d.length<4){toast('Cần ít nhất 4 từ','info');return home()}
 const n=Math.min(20,d.length),qs=shuffle(d).slice(0,n).map((w,i)=>{const t=['type','mc','tf'][i%3],q={w,t};if(t=='mc')q.opts=shuffle([w,...shuffle(d.filter(x=>x.id!=w.id)).slice(0,3)]);if(t=='tf'){q.truth=Math.random()<.5;q.shown=q.truth?w:shuffle(words.filter(x=>x.id!=w.id))[0]}return q});
 view('Kiểm tra',`<p class="muted">${n} câu · gõ từ, trắc nghiệm và đúng/sai</p>`+qs.map((q,i)=>`<div class="card q" style="margin-bottom:12px" data-q="${i}"><div class="kind">Câu ${i+1}/${n} · ${q.t=='type'?'Gõ từ tiếng Anh':q.t=='mc'?'Chọn nghĩa đúng':'Đúng hay sai?'}</div>
  ${q.t=='type'?`<div class="term">${esc(q.w.vi)}</div><input class="ti" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Đáp án câu ${i+1}">`
  :q.t=='mc'?`<div class="term">${esc(q.w.w)}</div><div class="opts" role="radiogroup">${q.opts.map((o,k)=>`<button class="opt" role="radio" aria-checked="false" data-id="${o.id}"><span class="n">${k+1}</span>${esc(o.vi)}</button>`).join('')}</div>`
  :`<div class="term">${esc(q.w.w)} <span class="muted">=</span> ${esc(q.shown.vi)}</div><div class="row" role="radiogroup"><button class="opt" role="radio" aria-checked="false" data-tf="1">${I('check','s')}Đúng</button><button class="opt" role="radio" aria-checked="false" data-tf="0">${I('x','s')}Sai</button></div>`}</div>`).join('')+`<button class="btn pri" id="sub">Nộp bài</button>`);
 $$('[data-q]').forEach(c=>$$('.opt',c).forEach(b=>b.onclick=()=>{$$('.opt',c).forEach(x=>{x.classList.remove('sel');x.setAttribute('aria-checked','false')});b.classList.add('sel');b.setAttribute('aria-checked','true');c.dataset.a=b.dataset.id||b.dataset.tf;buzz(5)}));
 $('#sub').onclick=()=>{let sc=0;const wrong=[];qs.forEach((q,i)=>{const c=$(`[data-q="${i}"]`);const ok=q.t=='type'?accepts(q.w).includes(norm($('.ti',c).value)):q.t=='mc'?c.dataset.a==q.w.id:c.dataset.a==(q.truth?'1':'0');if(ok)sc++;else wrong.push(q.w);grade(q.w,ok?4:0)});
  const p=Math.round(sc/n*100);if(p>=80)confetti();
  view('Kết quả',`<div class="res">${mascot(p>=80?'celebrate':p>=50?'happy':'sad',p>=80?'Xuất sắc! Cú Bông tự hào lắm.':p>=50?'Khá lắm, cố thêm chút nữa!':'Không sao, ôn lại rồi thử lại nhé.')}<div class="big">${p}%</div><p class="muted">Đúng ${sc}/${n} câu</p></div>
  ${wrong.length?`<h3>Cần ôn lại (${wrong.length})</h3><div class="list">${wrong.map(w=>`<div class="it"><div><b>${esc(w.w)}</b> <span class="muted">${esc(w.ipa)}</span><br><span class="muted">${esc(w.vi)}</span></div><button class="ib" data-au="${w.id}" aria-label="Nghe">${I('volume-2')}</button>${starBtn(w)}</div>`).join('')}</div>`:''}
  <div class="row"><button class="btn sec" onclick="location.hash='#/'">Trang chủ</button><button class="btn" id="rt">Làm bài mới</button></div>`);$('#rt').onclick=test}}

/* ---------- List & stats ---------- */
function list(){const d=deck();view('Danh sách từ',`<div class="search">${I('search')}<input type="search" id="sq" placeholder="Tìm từ hoặc nghĩa" aria-label="Tìm kiếm"></div><p class="muted" id="lc" aria-live="polite"></p><div class="list" id="ls"></div>`);
 const r=()=>{const q=norm($('#sq').value);const xs=d.filter(w=>!q||norm(w.w).includes(q)||norm(w.vi).includes(q));$('#lc').textContent=xs.length+' từ';
  $('#ls').innerHTML=xs.length?xs.map(w=>`<div class="it"><div><b>${esc(w.w)}</b> <span class="muted">${esc(w.ipa)}</span> <span class="tag lv">${esc(w.lv)}</span><br><span class="muted">${esc(w.vi)}</span></div><button class="ib" data-au="${w.id}" aria-label="Nghe ${esc(w.w)}">${I('volume-2')}</button>${starBtn(w)}</div>`).join(''):mascot('meditate','Không tìm thấy từ nào.')};
 let t;$('#sq').oninput=()=>{clearTimeout(t);t=setTimeout(r,120)};r()}
function stats(){const d=deck(),now=Date.now(),L=d.filter(w=>S.srs[w.id]&&S.srs[w.id].reps).length,M=d.filter(w=>S.srs[w.id]&&S.srs[w.id].int>=21).length,D=d.filter(w=>S.srs[w.id]&&S.srs[w.id].due<=now).length;
 const sp=d.filter(w=>S.speak[w.id]!=null),spa=sp.length?Math.round(sp.reduce((a,w)=>a+S.speak[w.id],0)/sp.length):0;
 const days=[...Array(7)].map((_,i)=>ymd(new Date(now-(6-i)*DAY))),mx=Math.max(1,...days.map(x=>(S.log[x]||{}).rev||0));
 view('Thống kê',`<div class="stat"><div><b>${L}/${d.length}</b><span class="muted">đã học</span></div><div><b>${D}</b><span class="muted">cần ôn</span></div><div><b>${M}</b><span class="muted">nhớ lâu (≥ 21 ngày)</span></div><div><b>${sp.length?spa:'–'}</b><span class="muted">điểm nói TB (${sp.length} từ)</span></div></div>
 <h3>Theo cấp độ</h3><div class="card" style="padding:4px 16px">${['A1','A2','B1','B2'].map(l=>{const a=d.filter(w=>w.cefr.includes(l)),b=a.filter(w=>S.srs[w.id]&&S.srs[w.id].reps).length;return a.length?`<div style="padding:12px 0"><div style="display:flex;justify-content:space-between"><b>${l}</b><span class="muted">${b}/${a.length}</span></div><div class="bar" style="margin-top:6px"><i style="width:${b/a.length*100}%"></i></div></div>`:''}).join('')}</div>
 <h3>7 ngày qua</h3><div class="card"><div class="chart" role="img" aria-label="Số lượt học 7 ngày qua">${days.map(x=>{const v=(S.log[x]||{}).rev||0;return `<div><i style="height:${v/mx*96}px"></i>${x.slice(8)}<br><b style="color:var(--text)">${v}</b></div>`}).join('')}</div></div>`)}

/* ---------- router & boot ---------- */
const R={'':home,cards,review,learn,speak,listen,match,test,list,stats};let cleanup=null;
function route(){keys=null;audio.pause();if(cleanup){try{cleanup()}catch(e){}cleanup=null}$('#back').onclick=()=>{location.hash='#/'};
 if(!words.length)return;if(!S.user||!S.user.done)return onboarding(0);const k=location.hash.replace(/^#\/?/,'');const r=(R[k]||home)();if(typeof r=='function')cleanup=r}
addEventListener('hashchange',route);
function applyTheme(){const dark=S.set.theme=='dark'||(S.set.theme=='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.body.classList.toggle('dark',dark);$('meta[name=theme-color]').content=dark?'#121214':'#F6F5F2'}
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',applyTheme);
if(S.set.dark!=null&&S.set.theme=='system'){S.set.theme=S.set.dark?'dark':'light';delete S.set.dark;save()}applyTheme();
const updVoice=()=>{$('#voice').textContent=S.set.voice=='us'?'US':'UK';$('#voice').setAttribute('aria-label','Giọng đọc: '+(S.set.voice=='us'?'Mỹ':'Anh')+'. Bấm để đổi')};updVoice();
$('#voice').onclick=()=>{S.set.voice=S.set.voice=='gb'?'us':'gb';save();updVoice();toast(S.set.voice=='gb'?'Giọng Anh (UK)':'Giọng Mỹ (US)','languages');buzz(8)};
$('#settings').onclick=openSettings;
addEventListener('offline',()=>toast('Đang offline: vẫn học được, âm thanh đã nghe sẽ có sẵn','wifi-off'));addEventListener('online',()=>toast('Đã có mạng trở lại','check'));
if('serviceWorker' in navigator){const had=!!navigator.serviceWorker.controller;navigator.serviceWorker.register('sw.js').then(r=>{r.addEventListener('updatefound',()=>{const n=r.installing;n&&n.addEventListener('statechange',()=>{if(n.state=='activated'&&had)toast('Đã cập nhật phiên bản mới','sparkles')})})}).catch(()=>{})}
function boot(){app.innerHTML=`<div class="sk" style="height:150px;margin:12px 0"></div><div class="sk" style="height:170px;margin-bottom:12px"></div><div class="modes"><div class="sk" style="height:112px"></div><div class="sk" style="height:112px"></div><div class="sk" style="height:112px"></div><div class="sk" style="height:112px"></div></div>`;
 loadData().then(route).catch(e=>{console.warn(e);view('',`${mascot('sad','Không tải được dữ liệu.')}<p class="muted center">Kiểm tra kết nối mạng rồi thử lại.</p><button class="btn" id="retry">${I('refresh-cw','s')}Thử lại</button>`,false);$('#retry').onclick=boot})}
boot();
