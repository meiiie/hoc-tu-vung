'use strict';
// Unit tests for pron.js scoring, using saved ZIPA log-probabilities (native TTS vs deliberately mispronounced).
const PR=require('../pron.js'),fs=require('fs'),path=require('path'),assert=require('assert');
const P=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/pron.json')));
const tok=[];fs.readFileSync(path.join(__dirname,'../vendor/zipa-tokens.txt'),'utf8').split('\n').forEach(l=>{const m=l.match(/^(.*) (\d+)$/);if(m)tok[+m[2]]=m[1]});
const L=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/logits.json')));
const run=k=>{const o=L[k];return PR.score(Float32Array.from(o.lp),o.T,o.V,tok,P[k.split('_')[0]],{uk:false})};
let n=0;const t=(name,f)=>{f();n++;console.log('ok',name)};
t('tokens: 127 entries, blank first',()=>{assert.strictEqual(tok.length,127)});
t('pron.json covers all 252 words',()=>{assert.ok(Object.keys(P).length>=252)});
t('bath: correct beats th->t by >=20',()=>{const a=run('p1-234_ok_guy'),b=run('p1-234_bad_guy');assert.ok(a.score-b.score>=20,a.score+' vs '+b.score);
  const th=b.phones.find(x=>x.p=='θ');assert.notStrictEqual(th.st,'ok')});
t('bad: correct beats ae->e',()=>{const a=run('p1-214_ok_ryan'),b=run('p1-214_bad_ryan');assert.ok(a.score>b.score);assert.notStrictEqual(b.phones.find(x=>x.p=='æ').st,'ok')});
t('accommodation: native high, Vietnamese accent low',()=>{const a=run('p1-015_ok_guy'),b=run('p1-015_ok_vi');assert.ok(a.score>=85);assert.ok(b.score<60)});
t('silence: empty logits give empty result and score 0, never a fake 100',()=>{const T=20,V=127,lp=new Float32Array(T*V).fill(-20);for(let i=0;i<T;i++)lp[i*V]=0;const r=PR.score(lp,T,V,tok,P['p1-234'],{});assert.ok(r.empty);assert.strictEqual(r.score,0)});
t('tips mention /θ/ when th is wrong',()=>{const tips=PR.tips(run('p1-234_bad_guy'),'bath');assert.ok(tips.some(x=>x.p=='θ'))});
console.log(n+' tests passed');
