'use strict';
/* "Cú Bông" – original mascot for Học Từ Vựng: a round little owl who carries a word book.
   States: idle, wave, think, happy, sad, meditate, celebrate, sleepy. Pure SVG + CSS, light. */
const MASCOT_NAME='Cú Bông';
function mascotSVG(state){const s=state||'idle';
 const props={
  think:`<g class="pr-book"><rect x="38" y="84" width="44" height="24" rx="3" fill="#fff" stroke="currentColor" stroke-width="3"/><path d="M60 84v24" stroke="currentColor" stroke-width="2.5"/><path d="M44 92h10M44 99h8M66 92h10M66 99h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></g><g class="pr-dots"><circle cx="96" cy="22" r="3"/><circle cx="104" cy="12" r="4.5"/></g>`,
  celebrate:`<g class="pr-hat"><path d="M48 22 L64 -6 L76 24 Z" fill="currentColor"/><circle cx="64" cy="-7" r="4" fill="#e9b949"/></g><g class="pr-conf"><rect x="12" y="20" width="6" height="3" fill="#e9b949"/><rect x="104" y="30" width="6" height="3" fill="#d9776a"/><circle cx="20" cy="52" r="2.5" fill="#7fae8e"/><circle cx="102" cy="58" r="2.5" fill="#e9b949"/><rect x="96" y="10" width="3" height="7" fill="#7fae8e"/><rect x="24" y="8" width="3" height="7" fill="#d9776a"/></g>`,
  sleepy:`<g class="pr-z" font-family="sans-serif" font-weight="800" fill="currentColor"><text x="92" y="30" font-size="14">z</text><text x="102" y="18" font-size="10">z</text></g>`,
  sad:`<path class="pr-tear" d="M84 52 q4 7 0 10 q-4 -3 0 -10z" fill="#8fb3d9"/>`,
  meditate:`<g class="pr-aura" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".5"><path d="M18 60 q-6 -10 2 -20"/><path d="M102 60 q6 -10 -2 -20"/></g>`,
  happy:`<g class="pr-spark" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M16 30l6 4M14 46h7M104 30l-6 4M106 46h-7"/></g>`,
  wave:`<g class="pr-spark" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M14 40l5 3M12 52h6M16 30l4 5"/></g>`};
 const eyes=s=='happy'||s=='celebrate'?`<path d="M45 56 q5 -7 10 0M65 56 q5 -7 10 0" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>`
  :s=='meditate'||s=='sleepy'?`<path d="M44 57 q6 5 12 0M64 57 q6 5 12 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`
  :s=='sad'?`<g class="eyes"><ellipse cx="50" cy="57" rx="4.5" ry="6"/><ellipse cx="70" cy="57" rx="4.5" ry="6"/></g><path d="M44 47l10 3M76 47l-10 3" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>`
  :`<g class="eyes"><ellipse cx="50" cy="56" rx="4.5" ry="6.5"/><ellipse cx="70" cy="56" rx="4.5" ry="6.5"/><circle cx="51.5" cy="53.5" r="1.6" fill="#fff"/><circle cx="71.5" cy="53.5" r="1.6" fill="#fff"/></g>`;
 const mouth=s=='sad'?`<path d="M55 74 q5 -4 10 0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>`
  :s=='think'?`<path d="M56 73h8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>`
  :s=='sleepy'?`<ellipse cx="60" cy="73" rx="3" ry="2.5"/>`
  :`<path d="M54 70 q6 6 12 0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>`;
 const wings=s=='meditate'?`<path d="M30 80 q-6 10 8 12 M90 80 q6 10 -8 12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`
  :`<path class="wl" d="M30 66 q-12 8 -6 22 q8 -2 10 -10" fill="#fff" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path class="wr" d="M90 66 q12 8 6 22 q-8 -2 -10 -10" fill="#fff" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>`;
 return `<svg viewBox="0 -12 120 142" class="mz" aria-hidden="true" fill="currentColor">
 <ellipse class="shadow" cx="60" cy="124" rx="${s=='meditate'?34:26}" ry="5" fill="currentColor" opacity=".12"/>
 <g class="body">
  <path d="M40 30 l-6 -14 l14 9 M80 30 l6 -14 l-14 9" fill="#fff" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
  <path d="M60 22 c26 0 38 20 38 46 c0 28 -16 46 -38 46 c-22 0 -38 -18 -38 -46 c0 -26 12 -46 38 -46z" fill="#fff" stroke="currentColor" stroke-width="3.2"/>
  <path d="M48 96 q12 8 24 0" fill="none" stroke="currentColor" stroke-width="2" opacity=".35" stroke-linecap="round"/>
  <ellipse cx="42" cy="68" rx="5" ry="3" fill="#f2b8a8" opacity=".7"/><ellipse cx="78" cy="68" rx="5" ry="3" fill="#f2b8a8" opacity=".7"/>
  ${eyes}<path d="M57 63 l3 4 l3 -4z" fill="#e9b949" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>${mouth}${wings}
  ${s=='meditate'?'<path d="M36 112 q24 10 48 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>':'<path d="M50 113v5M70 113v5" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>'}
 </g>${props[s]||''}</svg>`}
function mascot(state,text,opts={}){return `<div class="mascot ${opts.small?'small':''} ${opts.row?'row':''}" role="img" aria-label="${MASCOT_NAME}${text?': '+String(text).replace(/<[^>]+>/g,'').replace(/"/g,''):''}">
 <div class="mwrap m-${state}">${mascotSVG(state)}</div>${text?`<div class="bubble">${text}</div>`:''}</div>`}
/* swap state of a mascot already on screen */
function moodTo(el,state,text,ms){if(!el)return;const w=el.querySelector('.mwrap');w.className='mwrap m-'+state;w.innerHTML=mascotSVG(state);
 if(text!=null){let b=el.querySelector('.bubble');if(!b){b=document.createElement('div');b.className='bubble';el.appendChild(b)}b.innerHTML=text;b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop')}
 if(ms){clearTimeout(el._t);el._t=setTimeout(()=>moodTo(el,'idle'),ms)}}
