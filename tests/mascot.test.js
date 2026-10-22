'use strict';
// Mascot palette: every body colour, including its gradient highlight/shade (as mixed in style.css), keeps >= 3:1
// contrast against the page and card backgrounds of its theme (WCAG 1.4.11 non-text contrast).
const {NK_COLORS,NK_STATES}=require('../mascot.js'),assert=require('assert');
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mix=(a,b,t)=>a.map((v,i)=>Math.round(v*t+b[i]*(1-t)));
const lum=c=>{const [r,g,b]=c.map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4});return .2126*r+.7152*g+.0722*b};
const cr=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const BG={l:['#F6F5F2','#FFFFFF','#EFEDE8'],d:['#121214','#1B1B1F','#25252A']};let n=0;
for(const [k,c] of Object.entries(NK_COLORS))for(const th of ['l','d']){const b=hex(c[th]);
 for(const shade of [b,mix(b,[255,255,255],.84),mix(b,[0,0,0],.78)])for(const bg of BG[th]){const r=cr(shade,hex(bg));assert.ok(r>=3,`${k}/${th} vs ${bg}: ${r.toFixed(2)}`);n++}}
console.log('ok palette contrast ('+n+' pairs >= 3:1)');
for(const s of ['idle','listening','speaking','processing','correct','wrong','happy','sad','celebrate','sleepy','think'])assert.ok(NK_STATES.includes(s),s);
console.log('ok required states present ('+NK_STATES.length+')');
