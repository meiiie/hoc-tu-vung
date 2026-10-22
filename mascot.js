'use strict';
/* "Neko" – companion from the Wiii brand (github.com/meiiie/wiii, docs/assets/brand/neko-family-v1).
   Hand-built SVG that keeps the Neko Peek mark geometry (ivory cat peeking over a graphite tail) and the brand rules:
   expressions live in the eyes and the pose only (no mouth, no paws, no sad face), motion is soft and brief,
   and everything nonessential stops under prefers-reduced-motion.
   States: idle, wave, think, happy, sad (shown as "concerned"), meditate, celebrate, sleepy, surprised, encouraging, listen. */
const MASCOT_NAME='Neko';
const NK_STATES=['idle','wave','think','happy','sad','meditate','celebrate','sleepy','surprised','encouraging','listen'];
function mascotSVG(state){const s=NK_STATES.includes(state)?state:'idle';const closed=s=='meditate'||s=='sleepy';
 const eyes=closed?`<g class="lids"><path d="M100 106q11 7 22 0"/><path d="M146 103q11 7 22 0"/></g>`
  :`<g class="eyes"><ellipse class="el" cx="111" cy="103" rx="10" ry="15"/><ellipse class="er" cx="157" cy="100" rx="10" ry="15"/></g>`;
 const extra=s=='think'||s=='listen'?`<circle class="sky" cx="222" cy="44" r="9"/>`
  :s=='celebrate'?`<g class="sky spark"><circle cx="34" cy="60" r="7"/><circle cx="226" cy="40" r="9"/><circle cx="238" cy="96" r="5"/><circle cx="20" cy="104" r="5"/></g>`
  :s=='surprised'?`<g class="sky pop"><path d="M222 22V6M198 34l-10-10M246 34l10-10" stroke-width="7" stroke-linecap="round"/></g>`
  :s=='encouraging'?`<circle class="sky" cx="34" cy="52" r="7"/>`:'';
 return `<svg viewBox="0 0 256 256" class="nk nk-${s}" aria-hidden="true" focusable="false">
 <g class="whole"><path class="tail-b" d="M28 148C20 104 43 70 82 57c38-13 91-10 125 16 28 22 37 60 25 94-14 42-53 62-105 61-54-1-91-30-99-80Z"/>
 <g class="head"><path class="milk" d="M61 133c-7-22-6-53 1-77 5-18 18-25 34-15 21-11 49-14 76-8 10-18 28-18 37 1 10 21 12 52 4 78-8 26-36 42-72 43-36 1-70-7-80-22Z"/>${eyes}</g>
 <path class="tail-f" d="M31 136c31 23 72 38 117 41 33 2 61-7 84-29 3 24-7 47-29 62-23 16-59 22-100 16-43-6-71-31-77-63-2-10 0-19 5-27Z"/></g>${extra}</svg>`}
function mascot(state,text,opts={}){return `<div class="mascot ${opts.small?'small':''} ${opts.row?'row':''}" role="img" aria-label="${MASCOT_NAME}${text?': '+String(text).replace(/<[^>]+>/g,'').replace(/"/g,''):''}">
 <div class="mwrap m-${state}">${mascotSVG(state)}</div>${text?`<div class="bubble">${text}</div>`:''}</div>`}
/* swap the state of a mascot already on screen */
function moodTo(el,state,text,ms){if(!el)return;const w=el.querySelector('.mwrap');w.className='mwrap m-'+state;w.innerHTML=mascotSVG(state);
 if(text!=null){let b=el.querySelector('.bubble');if(!b){b=document.createElement('div');b.className='bubble';el.appendChild(b)}b.innerHTML=text;b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop')}
 if(ms){clearTimeout(el._t);el._t=setTimeout(()=>moodTo(el,'idle'),ms)}}
