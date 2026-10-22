'use strict';
/* Pronunciation scoring for hoc-tu-vung (v8).
   Acoustic model: ZIPA-CR-Ns small (Zhu et al., ACL 2025), a 64M-param Zipformer CTC phone recogniser, int8 ONNX.
   This file has no DOM dependency: Kaldi-style 80-bin fbank, CTC decoding, alignment of what was heard against the
   CMUdict reference, a GOP-style per-phone score, a stress estimate and Vietnamese-learner error hints. */
(function(G){
const PR={};
/* ---------- features: Kaldi fbank, 25ms/10ms, povey window, 512 FFT, 80 mel bins 20-7600 Hz, snip_edges=false ---------- */
let MEL=null,WIN=null;
function melBank(){const nF=257,n=80,m=f=>1127*Math.log(1+f/700),ml=m(20),mh=m(7600),fb=[];
 for(let i=0;i<n;i++){const l=ml+(mh-ml)*i/(n+1),c=ml+(mh-ml)*(i+1)/(n+1),r=ml+(mh-ml)*(i+2)/(n+1),row=new Float32Array(nF);let lo=nF,hi=0;
  for(let k=0;k<nF;k++){const mf=m(k*16000/512),v=Math.max(0,Math.min((mf-l)/(c-l),(r-mf)/(r-c)));row[k]=v;if(v>0){lo=Math.min(lo,k);hi=k}}fb.push({row,lo,hi})}return fb}
function fft(re,im){const n=re.length;for(let i=1,j=0;i<n;i++){let b=n>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]]}}
 for(let len=2;len<=n;len<<=1){const a=-2*Math.PI/len,wr=Math.cos(a),wi=Math.sin(a);for(let i=0;i<n;i+=len){let cr=1,ci=0;for(let k=0;k<len/2;k++){const p=i+k,q=p+len/2,tr=re[q]*cr-im[q]*ci,ti=re[q]*ci+im[q]*cr;re[q]=re[p]-tr;im[q]=im[p]-ti;re[p]+=tr;im[p]+=ti;const t=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=t}}}}
PR.fbank=function(x){if(!MEL){MEL=melBank();WIN=new Float64Array(400);for(let i=0;i<400;i++)WIN[i]=Math.pow(0.5-0.5*Math.cos(2*Math.PI*i/399),0.85)}
 const N=x.length,T=Math.floor((N+80)/160),out=new Float32Array(T*80),fr=new Float64Array(400),re=new Float64Array(512),im=new Float64Array(512),eps=1.1920929e-7;
 for(let m=0;m<T;m++){const s=m*160-120;let mean=0;for(let i=0;i<400;i++){let k=s+i;if(k<0)k=-k-1;if(k>=N)k=2*N-k-1;k=Math.max(0,Math.min(N-1,k));fr[i]=x[k];mean+=fr[i]}mean/=400;
  for(let i=0;i<400;i++)fr[i]-=mean;for(let i=399;i>0;i--)fr[i]-=0.97*fr[i-1];fr[0]-=0.97*fr[0];
  re.fill(0);im.fill(0);for(let i=0;i<400;i++)re[i]=fr[i]*WIN[i];fft(re,im);
  for(let b=0;b<80;b++){const {row,lo,hi}=MEL[b];let e=0;for(let k=lo;k<=hi;k++)e+=row[k]*(re[k]*re[k]+im[k]*im[k]);out[m*80+b]=Math.log(Math.max(e,eps))}}
 return {data:out,T}};
/* ---------- CTC greedy decode with per-token frame and confidence ---------- */
PR.decode=function(lp,T,V,tok){const out=[];let prev=-1;
 for(let t=0;t<T;t++){let b=0,bv=-1e9;for(let v=0;v<V;v++){const x=lp[t*V+v];if(x>bv){bv=x;b=v}}
  if(b!==prev&&b>3){const s=tok[b];if(s&&s!=='▁')out.push({s,t,p:Math.exp(bv),id:b})}prev=b}
 return out};
/* join diacritics/length marks onto the preceding symbol */
const MOD=new Set(['ː','ʰ','ʲ','ʷ','ʼ','˞','ˠ','ˤ','\u0303','\u031a','\u0325','\u0329','\u032a','\u0334','\u033a']);
PR.units=function(dec){const u=[];for(const d of dec){if(MOD.has(d.s)&&u.length){const l=u[u.length-1];l.s+=d.s;l.p=Math.min(l.p,Math.max(l.p,d.p));continue}u.push({s:d.s,t:d.t,p:d.p,id:d.id})}return u};
/* ---------- reference phones (CMUdict ARPAbet already mapped to IPA in data/pron.json) ---------- */
const VOW=new Set(['ɑ','æ','ʌ','ə','ɔ','aʊ','aɪ','ɛ','ɚ','eɪ','ɪ','i','oʊ','ɔɪ','ʊ','u']);
PR.isVowel=p=>VOW.has(p);
/* accepted realisations (US and UK) for each reference phone, written in the model's symbols */
const ACC={'ɑ':['ɑ','ɒ','a','ɑː','ɒː','aː','ɔ'],'æ':['æ','a','æː','aː'],'ʌ':['ʌ','ɐ','ə','a','ɑ'],'ə':['ə','ɐ','ɪ','ʌ','ɨ','ɵ','ɛ','ʊ','ɘ','ɜ'],'ɔ':['ɔ','ɔː','ɒ','ɑ','o','oː','ɑː'],
 'aʊ':['aʊ','æʊ','aw','au','ɐʊ'],'aɪ':['aɪ','ɑɪ','aj','ɐɪ','ai','äɪ'],'t͡ʃ':['tʃ','tɕ','ʧ'],'d͡ʒ':['dʒ','dʑ','ʤ'],'ɛ':['ɛ','e','eː','ɛː'],'ɚ':['ɚ','ə˞','ɜ˞','əɹ','ɜɹ','ɹ','ɜ','ɜː','ə','ɐ','ɝ','ɻ'],
 'eɪ':['eɪ','ej','e','eː','ɛɪ','ei'],'ɡ':['g','ɡ'],'i':['i','iː','ij','ɪi'],'ɪ':['ɪ','ɨ','i','e','ə'],'j':['j'],'ŋ':['ŋ','ŋg'],'oʊ':['oʊ','əʊ','o','oː','ɔʊ','ow','ou','ɵʊ','ɔ'],'ɔɪ':['ɔɪ','oɪ','ɔj','oj'],
 'ɹ':['ɹ','r','ɾ','ɻ','˞'],'ʃ':['ʃ','ɕ'],'ʊ':['ʊ','u'],'u':['u','uː','ʉ','ʉː','ʊ','uw'],'ʒ':['ʒ','ʑ'],'t':['t','tʰ','ʔ','ɾ','t̚'],'d':['d','ɾ','d̚'],'k':['k','kʰ','k̚'],'p':['p','pʰ','p̚'],
 'b':['b'],'f':['f'],'h':['h','ɦ'],'l':['l','ɫ','ɭ','ʟ'],'m':['m'],'n':['n'],'s':['s'],'v':['v','w'],'w':['w','ʍ'],'z':['z','s'],'ð':['ð'],'θ':['θ']};
const strip=s=>s.replace(/[ʰ\u031a\u0325\u0329\u032a\u0334\u033a]/g,'');
/* the phone symbols a model string spells, e.g. "tʃ" -> 2 symbols */
const glyphs=s=>{const a=[];for(const c of s){if(MOD.has(c)&&a.length)a[a.length-1]+=c;else a.push(c)}return a};
/* ---------- alignment: each reference phone consumes 0..3 heard symbols ---------- */
PR.align=function(ref,heard,opts={}){const R=ref.length,H=heard.length,INF=1e9;
 const cost=(r,str,i)=>{if(!str.length){const nonRhotic=r.p=='ɹ'&&!(ref[i+1]&&VOW.has(ref[i+1].p));return r.p=='ə'?0.6:nonRhotic&&opts.uk?0.1:1}
  const acc=ACC[r.p]||[r.p],s=strip(str);if(acc.includes(str)||acc.includes(s)||acc.map(strip).includes(s))return str==acc[0]||s==strip(acc[0])?0:0.15;
  const g=glyphs(s);if(g.length>1){/* partial: first glyph fits a single-glyph realisation */const one=acc.filter(a=>glyphs(a).length==1).map(strip);if(g.some(x=>one.includes(x)))return 0.55+0.25*(g.length-1)}
  return 1+0.3*(g.length-1)};
 const D=Array.from({length:R+1},()=>new Float64Array(H+1).fill(INF)),B=Array.from({length:R+1},()=>new Int8Array(H+1));D[0][0]=0;
 const INS=0.7;
 for(let i=0;i<=R;i++)for(let j=0;j<=H;j++){if(D[i][j]>=INF)continue;
  if(j<H&&D[i][j]+INS<D[i][j+1]){D[i][j+1]=D[i][j]+INS;B[i][j+1]=-1}
  if(i<R)for(let k=0;k<=3&&j+k<=H;k++){const str=heard.slice(j,j+k).map(u=>u.s).join(''),c=D[i][j]+cost(ref[i],str,i);if(c<D[i+1][j+k]){D[i+1][j+k]=c;B[i+1][j+k]=k}}}
 const res=[];let i=R,j=H;const ins=[];
 while(i>0||j>0){const k=B[i][j];if(k===-1&&j>0){ins.push(heard[j-1]);j--;continue}const seg=heard.slice(j-k,j),str=seg.map(u=>u.s).join('');
  const c=cost(ref[i-1],str,i-1);res.unshift({ref:ref[i-1],heard:str,seg,c});i--;j-=k}
 return {res,ins:ins.reverse(),total:D[R][H]}};
/* ---------- GOP-style score per phone: posterior of the expected symbol around where it should be ---------- */
PR.score=function(lp,T,V,tok,variants,opts={}){const tid={};tok.forEach((s,i)=>{if(s)tid[s]=i});
 const dec=PR.decode(lp,T,V,tok),heard=PR.units(dec);let best=null;
 for(const v of variants){const ref=v.map(([p,s])=>({p,s}));const a=PR.align(ref,heard,opts);if(!best||a.total<best.a.total)best={a,ref}}
 const {a,ref}=best;const post=(t,sym)=>{const id=tid[sym];if(id==null||t<0||t>=T)return 0;return Math.exp(lp[t*V+id])};
 let lastT=0;const ph=a.res.map((r,i)=>{let sc,st;
  if(r.c<=0.001){sc=Math.max(0.6,Math.min(1,0.55+0.5*Math.min(...r.seg.map(u=>u.p))));st='ok'}
  else if(r.c<=0.2){sc=Math.max(0.55,Math.min(0.95,0.5+0.45*Math.min(...r.seg.map(u=>u.p))));st='ok'}
  else{/* how much the model still believed in the expected sound near this spot */
   const t0=r.seg.length?r.seg[0].t:lastT,first=glyphs(strip((ACC[r.ref.p]||[r.ref.p])[0]))[0];let g=0;for(let t=Math.max(0,t0-3);t<=Math.min(T-1,t0+3);t++)g=Math.max(g,post(t,first));
   sc=r.heard?Math.min(0.5,g*0.8)*(r.c<0.9?1:0.7):Math.min(0.35,g*0.6);st=r.heard?(r.c<0.9?'close':'sub'):'del'}
  if(r.seg.length)lastT=r.seg[r.seg.length-1].t;return {p:r.ref.p,stress:r.ref.s,heard:r.heard,score:sc,st,t:r.seg.length?r.seg[0].t:null,t1:r.seg.length?r.seg[r.seg.length-1].t:null}});
 const extra=a.ins.length;let total=ph.reduce((s,x)=>s+x.score,0)/Math.max(1,ph.length);total*=Math.max(0.6,1-0.06*Math.max(0,extra-1));
 const heardStr=heard.map(u=>u.s).join('');
 return {score:Math.round(100*Math.max(0,Math.min(1,total))),phones:ph,heard:heardStr,extra:a.ins.map(u=>u.s),empty:!heard.length}};
/* ---------- stress: the primary-stressed vowel should be the most prominent (energy x duration) ---------- */
PR.stress=function(ph,pcm,sr,frameSec){const vs=ph.filter(x=>VOW.has(x.p)&&x.t!=null);const prim=ph.filter(x=>VOW.has(x.p)&&x.stress===1);if(vs.length<2||prim.length!==1||prim[0].t==null)return null;
 const prom=x=>{const a=Math.max(0,Math.floor((x.t-1)*frameSec*sr)),b=Math.min(pcm.length,Math.ceil((x.t1+2)*frameSec*sr));let e=0;for(let i=a;i<b;i++)e+=pcm[i]*pcm[i];return Math.sqrt(e/Math.max(1,b-a))*Math.sqrt(Math.max(1,x.t1-x.t+1))};
 const sc=vs.map(prom),top=vs[sc.indexOf(Math.max(...sc))];return {ok:top===prim[0],expected:ph.indexOf(prim[0]),got:ph.indexOf(top)}};
/* ---------- feedback written for Vietnamese learners ---------- */
const NAME={'θ':'/θ/ (th trong “think”)','ð':'/ð/ (th trong “this”)','ʃ':'/ʃ/ (sh)','ʒ':'/ʒ/','æ':'/æ/ (a bẹt)','ɛ':'/e/','i':'/iː/ (i dài)','ɪ':'/ɪ/ (i ngắn)','u':'/uː/','ʊ':'/ʊ/','ɹ':'/r/','l':'/l/','z':'/z/','s':'/s/','t͡ʃ':'/tʃ/','d͡ʒ':'/dʒ/','v':'/v/','eɪ':'/eɪ/','aɪ':'/aɪ/','oʊ':'/əʊ/','aʊ':'/aʊ/','ŋ':'/ŋ/','ɚ':'/ə(r)/','ə':'/ə/','ʌ':'/ʌ/','ɑ':'/ɑː/','ɔ':'/ɔː/'};
PR.phName=p=>NAME[p]||'/'+p+'/';
PR.tips=function(r,word){const t=[],ph=r.phones,last=ph.length-1,w=(word||'').toLowerCase();const bad=x=>x.st!='ok';
 ph.forEach((x,i)=>{if(!bad(x))return;const h=x.heard;
  if((x.p=='θ'||x.p=='ð')&&/^[tdfszt̪d̪]/.test(h||'x'))t.push({p:x.p,m:`Âm ${NAME[x.p]} nghe như /${h}/. Đặt đầu lưỡi giữa hai hàm răng rồi thổi hơi qua, đừng chặn lưỡi như âm “t/đ”.`});
  else if(x.p=='θ'||x.p=='ð')t.push({p:x.p,m:`Chưa nghe rõ ${NAME[x.p]}. Đưa đầu lưỡi ra giữa hai răng và thổi hơi.`});
  else if(x.p=='ʃ'&&/^s/.test(h||''))t.push({p:x.p,m:'Âm /ʃ/ nghe như /s/. Tròn môi, đẩy lưỡi lùi về sau một chút, như khi nói “suỵt”.'});
  else if(x.p=='æ'&&/^[eɛ]/.test(h||''))t.push({p:x.p,m:'Âm /æ/ nghe như /e/. Mở miệng rộng hơn, hạ hàm dưới, nói giữa “a” và “e”.'});
  else if(x.p=='i'&&/^ɪ/.test(h||''))t.push({p:x.p,m:'/iː/ là i dài: kéo dài âm và căng môi sang hai bên như khi cười.'});
  else if(x.p=='ɪ'&&/iː/.test(h||''))t.push({p:x.p,m:'/ɪ/ là i ngắn, thả lỏng; đừng kéo dài thành /iː/.'});
  else if(i==last&&!h&&(x.p=='s'||x.p=='z')&&/s$/.test(w))t.push({p:x.p,m:'Thiếu đuôi -s ở cuối từ. Giữ hơi để bật rõ âm /s/ hoặc /z/.'});
  else if(i==last&&!h&&(x.p=='d'||x.p=='t')&&/ed$/.test(w))t.push({p:x.p,m:'Thiếu đuôi -ed. Sau âm vô thanh đọc /t/, sau âm hữu thanh đọc /d/, sau t/d đọc /ɪd/.'});
  else if(i==last&&!PR.isVowel(x.p))t.push({p:x.p,m:`Âm cuối ${NAME[x.p]||'/'+x.p+'/'} ${h?'nghe như /'+h+'/':'bị mất'}. Người Việt hay nuốt phụ âm cuối: hãy phát âm trọn vẹn, có thể bật nhẹ hơi.`});
  else if(x.p=='ɹ'&&/^l/.test(h||''))t.push({p:x.p,m:'/r/ nghe như /l/. Cong lưỡi lên, không chạm vòm miệng.'});
  else if(x.p=='v'&&/^[bjw]/.test(h||''))t.push({p:x.p,m:'/v/: răng trên chạm nhẹ môi dưới rồi rung.'});
  else if((x.p=='s'||x.p=='z')&&!h)t.push({p:x.p,m:`Thiếu ${NAME[x.p]}. Giữ âm xì rõ ràng.`});
 });
 const seen=new Set();return t.filter(x=>!seen.has(x.m)&&seen.add(x.m)).slice(0,3)};
if(typeof module!='undefined')module.exports=PR;else G.PR=PR;
})(typeof self!='undefined'?self:this);
