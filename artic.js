'use strict';
/* Articulation guide: Vietnamese instructions + a animated mid-sagittal section for each English phone. */
const ARTIC=(()=>{
 const T={dental:{tip:[97,47],hump:[66,60]},alveolar:{tip:[86,41],hump:[66,58]},postalv:{tip:[82,45],hump:[70,44]},retroflex:{tip:[80,40],hump:[62,56],curl:1},
  velar:{tip:[86,62],hump:[50,37]},highfront:{tip:[89,57],hump:[72,43]},lowfront:{tip:[89,66],hump:[70,62]},highback:{tip:[86,64],hump:[54,43]},mid:{tip:[88,60],hump:[64,52]},
  low:{tip:[86,66],hump:[58,62]},lateral:{tip:[86,41],hump:[64,60],lat:1},rest:{tip:[88,60],hump:[64,55]}};
 /* lips: n neutral, s spread, r round, c closed, t lower lip to upper teeth */
 const D={
 'p':['c','rest',0,0,'Mím hai môi, giữ hơi rồi bật mạnh ra (có luồng hơi). Không rung cổ.','pen'],
 'b':['c','rest',0,1,'Mím hai môi rồi bật ra, cổ họng rung.','bad'],
 'm':['c','rest',0.1,1,'Mím môi, để hơi đi ra mũi, cổ họng rung. Ở cuối từ phải giữ môi khép đủ lâu.','aim'],
 'f':['t','rest',0.2,0,'Răng trên chạm nhẹ môi dưới, thổi hơi qua khe. Không rung.','beef'],
 'v':['t','rest',0.2,1,'Răng trên chạm nhẹ môi dưới, thổi hơi và rung cổ. Không đọc thành “d” hay “b”.','very'],
 'θ':['n','dental',0.25,0,'Đưa đầu lưỡi ra giữa hai hàm răng, thổi hơi nhẹ qua khe. Không rung, không chặn lưỡi như “t”.','think'],
 'ð':['n','dental',0.25,1,'Đầu lưỡi giữa hai răng như /θ/, nhưng rung cổ. Không đọc thành “đ” hay “d”.','this'],
 't':['n','alveolar',0.2,0,'Đầu lưỡi chạm lợi sau răng trên, bật hơi mạnh. Ở cuối từ vẫn phải chặn lưỡi rõ.','tea'],
 'd':['n','alveolar',0.2,1,'Đầu lưỡi chạm lợi sau răng trên, rung cổ. Âm cuối /d/ không được bỏ (đuôi -ed).','bad'],
 's':['s','alveolar',0.15,0,'Đầu lưỡi gần lợi trên (không chạm), răng gần khép, thổi hơi tạo tiếng xì. Đuôi -s phải nghe rõ.','see'],
 'z':['s','alveolar',0.15,1,'Như /s/ nhưng rung cổ, tiếng “dzz” như ong bay.','zoo'],
 'ʃ':['r','postalv',0.2,0,'Tròn và đẩy môi ra trước, lưỡi lùi sau lợi một chút, thổi hơi như “suỵt”.','she'],
 'ʒ':['r','postalv',0.2,1,'Như /ʃ/ nhưng rung cổ.','measure'],
 't͡ʃ':['r','postalv',0.2,0,'Lưỡi chạm sau lợi rồi bật ra thành /ʃ/: “tʃ”. Ở cuối từ (beach) phải bật rõ.','chair'],
 'd͡ʒ':['r','postalv',0.2,1,'Như /tʃ/ nhưng rung cổ.','job'],
 'k':['n','velar',0.3,0,'Cuống lưỡi chạm vòm mềm, bật hơi. Âm cuối /k/ phải chặn rõ, không nuốt.','key'],
 'ɡ':['n','velar',0.3,1,'Cuống lưỡi chạm vòm mềm, rung cổ.','go'],
 'ŋ':['n','velar',0.3,1,'Cuống lưỡi chạm vòm mềm, hơi ra mũi, như “ng” tiếng Việt; không thêm “k”.','sing'],
 'n':['n','alveolar',0.2,1,'Đầu lưỡi chạm lợi trên, hơi ra mũi. Đừng đổi /n/ cuối thành “ng”.','no'],
 'l':['n','lateral',0.25,1,'Đầu lưỡi chạm lợi trên, hơi đi hai bên lưỡi. /l/ cuối từ (ball): lưỡi vẫn nâng lên.','leg'],
 'ɹ':['r','retroflex',0.25,1,'Cong đầu lưỡi lên và lùi lại, không chạm vòm miệng; môi hơi tròn. Không rung lưỡi như “r” tiếng Việt.','red'],
 'j':['s','highfront',0.15,1,'Như “i” lướt nhanh sang nguyên âm sau, như “d” miền Nam.','yes'],
 'w':['r','highback',0.15,1,'Chu môi tròn rồi mở nhanh, như “u” lướt.','we'],
 'h':['n','rest',0.4,0,'Thở hơi nhẹ từ cổ họng, như “h” tiếng Việt.','he'],
 'i':['s','highfront',0.1,1,'/iː/ i dài: căng môi sang hai bên như đang cười, kéo dài âm.','see'],
 'ɪ':['n','highfront',0.25,1,'/ɪ/ i ngắn: thả lỏng, miệng hơi mở hơn /iː/, nói nhanh, gần “ê”.','sit'],
 'ɛ':['n','mid',0.45,1,'/e/: miệng mở vừa, như “e” tiếng Việt.','bed'],
 'æ':['s','lowfront',0.85,1,'/æ/: mở miệng rộng, hạ hàm, lưỡi thấp phía trước; giữa “a” và “e”. Không đọc thành /e/.','cat'],
 'ʌ':['n','low',0.6,1,'/ʌ/: miệng mở vừa, thả lỏng, ngắn như “ă”.','cup'],
 'ɑ':['n','low',0.85,1,'/ɑː/: mở miệng rộng, lưỡi thấp và lùi sau, kéo dài như “a”.','father'],
 'ɔ':['r','highback',0.6,1,'/ɔː/: tròn môi, miệng mở vừa, kéo dài như “o”.','law'],
 'ʊ':['r','highback',0.25,1,'/ʊ/ u ngắn: môi hơi tròn, thả lỏng, nói nhanh.','book'],
 'u':['r','highback',0.15,1,'/uː/ u dài: chu tròn môi, kéo dài.','food'],
 'ə':['n','mid',0.35,1,'/ə/ âm yếu: thả lỏng hoàn toàn, nói rất nhẹ và ngắn, như “ơ” lướt.','about'],
 'ɚ':['r','retroflex',0.35,1,'/ə(r)/: âm ơ nhẹ; giọng Mỹ cong lưỡi lên ở cuối, giọng Anh thì không.','teacher'],
 'eɪ':['s','mid',0.4,1,'/eɪ/: bắt đầu ở “ê” rồi lướt lên “i”.','day'],
 'aɪ':['n','low',0.8,1,'/aɪ/: bắt đầu ở “a” rồi lướt lên “i”.','my'],
 'ɔɪ':['r','highback',0.5,1,'/ɔɪ/: từ “o” lướt sang “i”.','boy'],
 'aʊ':['n','low',0.8,1,'/aʊ/: từ “a” lướt sang “u”, môi tròn dần.','now'],
 'oʊ':['r','highback',0.4,1,'/əʊ/: từ “ơ” lướt sang “u”, môi tròn dần (Mỹ: “ô-u”).','go']};
 /* v11: original animated mid-sagittal section (face to the right). Rest pose -> target pose -> hold -> release, looped.
    Every moving part keeps the same path structure in all poses so SMIL can interpolate it (works in Safari).
    Geometry is our own schematic, informed by (not copied from) Seeing Speech (Glasgow), Sounds of Speech (Iowa) and Rachel's English. */
 const P={rest:{t:[150,104],h:[105,90]},dental:{t:[167,97],h:[112,92]},alveolar:{t:[151,83],h:[110,90]},postalv:{t:[144,85],h:[118,77]},
  retroflex:{t:[140,84],h:[110,82]},velar:{t:[148,108],h:[82,66]},highfront:{t:[153,104],h:[124,75]},lowfront:{t:[153,110],h:[120,99]},
  highback:{t:[148,108],h:[90,77]},mid:{t:[151,106],h:[108,88]},low:{t:[148,111],h:[98,101]},lateral:{t:[151,83],h:[104,97]}};
 const STOP=new Set(['p','b','t','d','k','ɡ','t͡ʃ','d͡ʒ']),NASAL=new Set(['m','n','ŋ']);
 const GLIDE={'eɪ':'i','aɪ':'i','ɔɪ':'i','aʊ':'u','oʊ':'u'};
 const coronal=k=>['dental','alveolar','postalv','retroflex','lateral'].includes(k);
 function pose(lips,tg,jaw){const q=P[tg]||P.rest,jy=jaw*16,dy=coronal(tg)?jy*0.15:jy*0.7,t=[q.t[0],q.t[1]+dy],h=[q.h[0],q.h[1]+dy*0.8];
  const lx=lips=='r'?178:lips=='s'?168:172,low=lips=='c'?94:lips=='t'?98:100+jy,lo=lips=='t'?160:lips=='r'?lx:lx-1;
  return {jy,
   tongue:`M62 152 C50 122 ${h[0]-34} ${h[1]} ${h[0]} ${h[1]} C${h[0]+22} ${h[1]} ${t[0]-14} ${t[1]-4} ${t[0]} ${t[1]} C${t[0]+2} ${t[1]+8} ${t[0]-8} ${t[1]+14} ${t[0]-20} ${t[1]+16} L130 ${130+jy} C110 ${140+jy*0.6} 80 150 62 152Z`,
   ulip:`M163 78 C${lx-2} 78 ${lx+3} 84 ${lx} ${lips=='c'?93:91} C${lx-5} ${lips=='c'?94:93} 166 93 162 91`,
   llip:`M${lo-2} ${low+1} C${lo+3} ${low} ${lo+5} ${low+8} ${lo} ${low+14} C${lo-6} ${low+16} 160 ${low+15} 158 ${low+12}`,
   jaw:`M${lo} ${low+14} C${lo+2} ${low+30} 168 ${132+jy} 150 ${140+jy} L104 ${152+jy*0.5}`,
   lteeth:`M155 ${112+jy} L156 ${101+jy} Q159 ${99+jy} 161 ${101+jy} L161 ${112+jy}Z`,
   air:(()=>{const pal=x=>x<110?70-(x-70)*0.12:Math.min(96,65+(x-110)*0.55),m=(x,y)=>Math.round((pal(x)+y)/2),lm=(Math.min(low,100)+91)/2;
    return `M44 158 C46 124 50 98 66 ${m(70,h[1]+6)} S ${h[0]} ${m(h[0],h[1])} ${Math.min(t[0],158)} ${m(Math.min(t[0],158),t[1])} L192 ${lm}`})()}}
 const reduce=()=>typeof matchMedia=='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 function svg(p){const d=D[p];if(!d)return'';const [lips,tg,jaw,voiced]=d,R=pose('n','rest',0.12),T=pose(lips,tg,jaw);
  const g=GLIDE[p]&&D[GLIDE[p]],T2=g?pose(g[0],g[1],g[2]):T,nasal=NASAL.has(p),stop=STOP.has(p),still=reduce(),dur=2.8;
  const kt='0;0.25;0.5;0.75;1',ks='.4 0 .2 1;.4 0 .2 1;.4 0 .2 1;.4 0 .2 1';
  const A=(a,b,c)=>still?'':`<animate attributeName="d" dur="${dur}s" repeatCount="indefinite" keyTimes="${kt}" calcMode="spline" keySplines="${ks}" values="${R[a]};${T[a]};${T2[a]};${T2[a]};${R[a]}"/>`;
  const F=k=>still?T2[k]:R[k];
  const vel=nasal?'M70 70 Q62 84 60 98':'M70 70 Q58 74 49 78';
  const airOp=still?'':stop?`<animate attributeName="opacity" dur="${dur}s" repeatCount="indefinite" keyTimes="0;0.6;0.66;0.8;1" values="0;0;1;1;0"/>`:`<animate attributeName="opacity" dur="${dur}s" repeatCount="indefinite" keyTimes="0;0.2;0.3;0.75;0.85;1" values="0;0;1;1;0;0"/>`;
  const flow=still?'':`<animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.6s" repeatCount="indefinite"/>`;
  const airPath=nasal?'M44 158 L46 104 Q50 68 82 58 C120 50 160 52 186 64':T2.air;
  const vib=voiced?`<g class="m-voice"><path d="M36 162 l4 -4 4 4 4 -4 4 4 4 -4">${still?'':'<animateTransform attributeName="transform" type="translate" values="0 0;0 1.5;0 0" dur="0.12s" repeatCount="indefinite"/>'}</path></g>`:`<path class="m-folds" d="M36 160 l8 4 M56 160 l-8 4"/>`;
  return `<svg viewBox="0 0 200 180" class="mouth" role="img" aria-label="Mặt cắt dọc miệng khi phát âm /${p}/${voiced?', có rung dây thanh':', không rung'}${nasal?', hơi ra đường mũi':''}">
  <path class="m-face" d="M58 10 C110 0 160 14 176 40 L190 62 Q192 68 184 70 L178 70 Q170 74 164 78"/>
  <path class="m-nasal" d="M66 66 C80 46 140 44 176 62"/>
  <path class="m-wall" d="M48 40 L48 150 Q48 158 44 166"/>
  <path class="m-palate" d="M70 70 C90 62 120 60 140 68 C148 72 152 78 156 84 L158 96 Q160 99 162 96 L163 80"/>
  <path class="m-velum" d="${vel}"/>
  <path class="m-tongue" d="${F('tongue')}">${A('tongue')}</path>
  <path class="m-teeth" d="${F('lteeth')}">${A('lteeth')}</path>
  <path class="m-lip" d="${F('ulip')}">${A('ulip')}</path><path class="m-lip" d="${F('llip')}">${A('llip')}</path>
  <path class="m-jaw" d="${F('jaw')}">${A('jaw')}</path>
  <path class="m-air" d="${airPath}" opacity="${still?1:0}">${airOp}${flow}</path>
  ${vib}<text x="60" y="172" class="m-lab">${voiced?'dây thanh rung':'dây thanh không rung'}</text>${nasal?'<text x="120" y="40" class="m-lab">hơi ra mũi</text>':''}
  </svg>`}
 return {has:p=>!!D[p],svg,text:p=>D[p]&&D[p][4],ex:p=>D[p]&&D[p][5]}})();
