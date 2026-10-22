'use strict';
/* Articulation guide: Vietnamese instructions + a schematic side view of the mouth for each English phone. */
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
 function svg(p){const d=D[p];if(!d)return'';const [lips,tg,jaw,voiced]=d,t=T[tg],j=jaw*12;
  const lx=lips=='r'?106:lips=='s'?100:102,ly=lips=='c'?47:48+j*0.8,uly=lips=='c'?46:44;
  const tip=[t.tip[0],t.tip[1]+(tg=='dental'||tg=='alveolar'||tg=='postalv'||tg=='retroflex'||tg=='lateral'?0:j*0.6)],hump=[t.hump[0],t.hump[1]+j*0.4];
  const tongue=`M30 92 C34 ${hump[1]+18} ${hump[0]-14} ${hump[1]} ${hump[0]} ${hump[1]} S ${tip[0]-6} ${tip[1]-2} ${tip[0]} ${tip[1]}${t.curl?` q3 -6 -2 -8`:''} C ${tip[0]-4} ${tip[1]+8} ${hump[0]+6} ${74+j} ${hump[0]-4} ${80+j} L30 96Z`;
  const lowerLip=lips=='t'?`M${lx-6} ${50+j*0.5} q4 -6 0 -9`:`M${lx} ${ly} q4 4 0 10`;
  return `<svg viewBox="0 0 120 100" class="mouth" role="img" aria-label="Hình miệng khi phát âm ${p}">
  <path class="m-face" d="M8 4 C30 0 60 2 80 12 Q96 18 100 26 L110 30 Q104 36 98 36 Q104 40 ${lx} ${uly} Q100 47 96 47"/>
  <path class="m-palate" d="M20 48 C26 30 44 26 62 26 C76 26 84 30 88 38 L92 42"/>
  <rect class="m-teeth" x="90" y="40" width="5" height="7" rx="1.5"/><rect class="m-teeth" x="90" y="${49+j}" width="5" height="6" rx="1.5"/>
  <path class="m-lip" d="M96 47 Q102 48 ${lips=='t'?96:lx} ${lips=='t'?51+j*0.5:ly}"/><path class="m-lip" d="${lowerLip}"/>
  <path class="m-jaw" d="M${lx-2} ${ly+10} Q96 ${70+j} 70 ${84+j} L40 96"/>
  <path class="m-tongue" d="${tongue}"/>
  ${voiced?`<path class="m-voice" d="M14 70 l3 -4 3 4 3 -4 3 4 3 -4"/><text x="12" y="82" class="m-lab">rung</text>`:`<text x="12" y="82" class="m-lab">không rung</text>`}
  ${p=='m'||p=='n'||p=='ŋ'?`<path class="m-air" d="M70 20 Q90 10 106 22" marker-end="url(#ar)"/>`:`<path class="m-air" d="M60 ${hump[1]+6} Q90 ${tip[1]-2} 114 ${ly-2}"/>`}
  </svg>`}
 return {has:p=>!!D[p],svg,text:p=>D[p]&&D[p][4],ex:p=>D[p]&&D[p][5]}})();
