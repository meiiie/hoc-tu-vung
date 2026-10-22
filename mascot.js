'use strict';
/* Neko v8: a procedural SVG character, written for this app. The animation anatomy follows the ideas documented in
   github.com/ArvinYin1/grokbot-animation-anatomy (every frame computed; radial-outline body; Bezier keyframe clips on a few
   tracks; 120 Hz springs between states; eyes placed on a sphere for pseudo-3D; blinks embedded in clips) and keeps the
   Wiii Neko cat ears. No third-party code or animation data is used. */
const MASCOT_NAME='Neko';
const NK_STATES=['idle','wave','think','happy','sad','meditate','celebrate','sleepy','surprised','encouraging','listen','listening','speaking','correct','wrong','analyzing'];
const NK=(()=>{
 const RM=matchMedia('(prefers-reduced-motion: reduce)');let uid=0;const live=new Set();
 /* cubic-bezier easing (x->t solved by Newton) */
 const bez=(x1,y1,x2,y2)=>x=>{let t=x;for(let i=0;i<6;i++){const cx=3*x1*t*(1-t)**2+3*x2*t*t*(1-t)+t**3-x,d=3*x1*(1-t)**2+6*(x2-x1)*t*(1-t)+3*(1-x2)*t*t;if(Math.abs(d)<1e-6)break;t-=cx/d}t=Math.min(1,Math.max(0,t));return 3*y1*t*(1-t)**2+3*y2*t*t*(1-t)+t**3};
 const E={io:bez(.45,0,.55,1),out:bez(.2,.8,.3,1),back:bez(.3,1.6,.5,1),in:bez(.5,0,.9,.4)};
 /* eye expressions: w,h pill size; arc 1 = happy curve, -1 = sad tilt; lid = closed amount */
 const X={neutral:{w:9,h:19,arc:0,tilt:0,lid:0},happy:{w:13,h:9,arc:1,tilt:0,lid:0},wide:{w:11,h:23,arc:0,tilt:0,lid:0},squint:{w:12,h:7,arc:0,tilt:.12,lid:.2},
  sad:{w:9,h:15,arc:0,tilt:-.38,lid:.15},closed:{w:13,h:2.5,arc:0,tilt:0,lid:0},focus:{w:9,h:15,arc:0,tilt:0,lid:0},soft:{w:12,h:8,arc:.75,tilt:0,lid:0}};
 /* clips: keyframes [time s, {track:value}, easing]; tracks y,x,rot,sx,sy,yaw,pitch,ear,earT. loop=seconds or 0; blinks = times */
 const C={
  idle:{x:'neutral',loop:6,blink:[1.9,4.7],k:[[0,{y:0,sy:1,yaw:0,pitch:0}],[1.5,{y:-1.2,sy:1.012,yaw:.1,pitch:-.04},'io'],[3,{y:0,sy:1,yaw:.12,pitch:0},'io'],[4.5,{y:-1.2,sy:1.012,yaw:-.12,pitch:.03},'io'],[6,{y:0,sy:1,yaw:0,pitch:0},'io']]},
  wave:{x:'happy',next:['idle',2.4],k:[[0,{y:0,sy:1,ear:0}],[.18,{y:2,sy:.92,sx:1.06},'out'],[.42,{y:-10,sy:1.08,sx:.95,rot:-6,ear:1},'out'],[.7,{y:0,sy:.96,sx:1.03,rot:4},'in'],[.9,{y:-4,rot:-4,ear:.4},'out'],[1.15,{y:0,sy:1,sx:1,rot:0,ear:0},'io']]},
  think:{x:'focus',loop:4,blink:[2.6],decor:'orbit',k:[[0,{yaw:-.35,pitch:-.3,rot:-5,earT:-.3}],[2,{yaw:-.28,pitch:-.34,rot:-7,y:-1},'io'],[4,{yaw:-.35,pitch:-.3,rot:-5,y:0},'io']]},
  happy:{x:'happy',k:[[0,{y:0,sy:1}],[.15,{y:2,sy:.93,sx:1.05},'out'],[.38,{y:-9,sy:1.06,sx:.96,ear:.8},'out'],[.62,{y:0,sy:.95,sx:1.04},'in'],[.8,{y:-3,sy:1.02},'out'],[1,{y:0,sy:1,sx:1,ear:.2},'io']]},
  correct:{x:'happy',decor:'spark',k:[[0,{y:0,sy:1}],[.12,{y:2,sy:.9,sx:1.07},'out'],[.38,{y:-12,sy:1.08,sx:.95,ear:1},'out'],[.64,{y:0,sy:.94,sx:1.05},'in'],[.86,{y:0,sy:1,sx:1,ear:.5},'io']]},
  celebrate:{x:'happy',decor:'spark',loop:1.6,k:[[0,{y:0,sy:1,rot:0}],[.2,{y:3,sy:.88,sx:1.08},'out'],[.5,{y:-16,sy:1.1,sx:.94,rot:8,ear:1},'out'],[.85,{y:0,sy:.92,sx:1.06,rot:0},'in'],[1.1,{y:-5,sy:1.03,rot:-5},'out'],[1.6,{y:0,sy:1,sx:1,rot:0},'io']]},
  sad:{x:'sad',blink:[2.2],k:[[0,{y:0,pitch:0,ear:0}],[.8,{y:4,pitch:.3,sy:.97,ear:-1,earT:.4},'out']]},
  wrong:{x:'squint',k:[[0,{x:0,rot:0}],[.1,{x:-4,rot:-5,ear:-.6},'out'],[.25,{x:4,rot:5},'io'],[.4,{x:-3,rot:-3},'io'],[.55,{x:2,rot:2},'io'],[.75,{x:0,rot:0,y:2,pitch:.15,ear:-.5},'io']]},
  meditate:{x:'closed',loop:7,k:[[0,{y:0,sy:1}],[3.5,{y:-4,sy:1.01},'io'],[7,{y:0,sy:1},'io']]},
  sleepy:{x:'closed',loop:5,decor:'zz',k:[[0,{y:2,rot:6,sy:.98,ear:-.6}],[2.5,{y:3,rot:7,sy:.96},'io'],[5,{y:2,rot:6,sy:.98},'io']]},
  surprised:{x:'wide',k:[[0,{y:0,sy:1,ear:0}],[.1,{y:-7,sy:1.1,sx:.93,ear:1.2},'out'],[.35,{y:0,sy:.97,sx:1.02},'io'],[.6,{y:0,sy:1,sx:1,ear:.9},'io']]},
  encouraging:{x:'soft',blink:[2.4],k:[[0,{rot:0,y:0}],[.3,{rot:5,y:2,pitch:.15},'out'],[.6,{rot:5,y:-1,pitch:-.05},'io'],[.9,{rot:5,y:2,pitch:.15},'io'],[1.2,{rot:4,y:0,pitch:0,ear:.3},'io']]},
  listen:{x:'focus',loop:3,blink:[1.8],decor:'rings',k:[[0,{ear:1,earT:-.35,yaw:.15,pitch:-.05,rot:3}],[1.5,{ear:1.1,y:-1},'io'],[3,{ear:1,y:0},'io']]},
  speaking:{x:'soft',loop:.9,decor:'wave',k:[[0,{sy:1,y:0}],[.22,{sy:1.04,sx:.97,y:-2},'out'],[.45,{sy:.98,sx:1.01,y:0},'io'],[.68,{sy:1.03,sx:.98,y:-1},'out'],[.9,{sy:1,sx:1,y:0},'io']]}};
 C.listening=C.listen;C.analyzing=C.think;
 const BASE={y:0,x:0,rot:0,sx:1,sy:1,yaw:0,pitch:0,ear:0,earT:0};
 function sample(clip,t){const k=clip.k,o={...BASE};if(clip.loop)t%=clip.loop;
  for(const tr in BASE){let a=null,b=null;for(const f of k)if(tr in f[1]){if(f[0]<=t)a=f;else if(!b)b=f}
   if(!a&&!b)continue;if(!b){o[tr]=a[1][tr];continue}if(!a){o[tr]=b[1][tr];continue}const u=(t-a[0])/(b[0]-a[0]);o[tr]=a[1][tr]+(b[1][tr]-a[1][tr])*(E[b[2]]||E.io)(u)}
  let lid=0;for(const bt of clip.blink||[]){const u=(t-bt)/.26;if(u>=0&&u<=1)lid=Math.max(lid,u<.45?u/.45:1-(u-.45)/.55)}o.blink=lid;return o}
 /* body: radial outline with two cat ears (sampled rays -> closed Catmull-Rom path) */
 function outline(ear,earT,sx,sy){const N=72,R=40,pts=[];
  for(let i=0;i<N;i++){const a=i/N*2*Math.PI-Math.PI/2;let r=R*(1-0.05*Math.pow(Math.max(0,Math.sin(a)),6)+0.025*Math.cos(2*a));
   for(const s of [-1,1]){const c=s*(0.66+0.05*earT*s),w=0.36,d=Math.atan2(Math.sin(a+Math.PI/2-c),Math.cos(a+Math.PI/2-c)),h=(17+5*ear);r+=h*Math.pow(Math.max(0,1-Math.abs(d)/w),1.5)}
   pts.push([Math.cos(a)*r*sx*1.06,Math.sin(a)*r*sy+4*(1-sy)*R/4])}
  let p=`M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;for(let i=0;i<N;i++){const p0=pts[(i-1+N)%N],p1=pts[i],p2=pts[(i+1)%N],p3=pts[(i+2)%N];
   p+=`C${(p1[0]+(p2[0]-p0[0])/6).toFixed(1)} ${(p1[1]+(p2[1]-p0[1])/6).toFixed(1)} ${(p2[0]-(p3[0]-p1[0])/6).toFixed(1)} ${(p2[1]-(p3[1]-p1[1])/6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`}return p+'Z'}
 /* eye centres on a sphere, rotated by yaw/pitch, orthographic projection */
 function eyePos(side,yaw,pitch){const lon=side*0.36,lat=-0.06;let x=Math.sin(lon)*Math.cos(lat),y=Math.sin(lat),z=Math.cos(lon)*Math.cos(lat);
  let x1=x*Math.cos(yaw)+z*Math.sin(yaw),z1=-x*Math.sin(yaw)+z*Math.cos(yaw);let y2=y*Math.cos(pitch)-z1*Math.sin(pitch),z2=y*Math.sin(pitch)+z1*Math.cos(pitch);return [x1*36,y2*36,Math.max(.35,z2)]}
 function pill(cx,cy,w,h,tilt){const r=Math.min(w,h)/2,hw=w/2,hh=h/2;return `<rect x="${(cx-hw).toFixed(2)}" y="${(cy-hh).toFixed(2)}" width="${w.toFixed(2)}" height="${Math.max(.5,h).toFixed(2)}" rx="${r.toFixed(2)}" transform="rotate(${(tilt*57.3).toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})"/>`}
 function decor(kind,t,id){if(!kind)return'';const P=(x,y,r,o=1)=>`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" opacity="${o.toFixed(2)}"/>`;
  if(kind=='orbit'){let s='';for(let i=0;i<3;i++){const a=t*2.2+i*2.09;s+=P(Math.cos(a)*50,-34+Math.sin(a)*9,i==0?3.2:2.4,.45+.55*(Math.sin(a)+1)/2)}return s}
  if(kind=='spark'){let s='';for(let i=0;i<6;i++){const a=i*1.047+.3,u=Math.min(1,t/0.7),d=34+22*E.out(u);s+=P(Math.cos(a)*d,Math.sin(a)*d-4,2.6*(1-u*.6),1-u*.7)}return s}
  if(kind=='rings'){let s='';for(let i=0;i<2;i++){const u=((t*0.9+i*.5)%1),r=10+u*12;for(const sd of [-1,1])s+=`<path d="M${sd*(46+u*6)} ${-12-r*.6} q${sd*r*.5} ${r*.6} 0 ${r*1.2}" fill="none" stroke-width="2.4" stroke-linecap="round" opacity="${(1-u).toFixed(2)}"/>`}return s}
  if(kind=='wave'){let s='';for(let i=0;i<4;i++){const h=4+7*Math.abs(Math.sin(t*7+i*1.3));s+=`<rect x="${50+i*5}" y="${(-4-h/2).toFixed(1)}" width="2.6" height="${h.toFixed(1)}" rx="1.3"/>`}return s}
  if(kind=='zz'){const u=(t%2.4)/2.4;return P(40+u*10,-40-u*16,2+u*2,1-u)+P(48,-30,1.8,.5)}return''}
 class Bot{constructor(el){this.el=el;this.id='nk'+(++uid);this.st=el.dataset.state||'idle';this.t0=performance.now();this.pos={...BASE,blink:0};this.vel={};for(const k in BASE)this.vel[k]=0;
   this.ex={...X[C[this.st]?C[this.st].x:'neutral']};this.svgInit();this.frame(performance.now(),true);live.add(this);el._nk=this;loop()}
  svgInit(){this.el.innerHTML=`<svg class="nk2" viewBox="-66 -74 132 132" aria-hidden="true" focusable="false"><defs><radialGradient id="${this.id}g" cx="35%" cy="28%" r="80%"><stop offset="0" class="nk-hi"/><stop offset=".55" class="nk-mid"/><stop offset="1" class="nk-lo"/></radialGradient></defs>
   <ellipse class="nk-shadow" cx="0" cy="47" rx="30" ry="4"/><g class="nk-body"><path class="nk-fill" fill="url(#${this.id}g)"/><g class="nk-eyes"></g></g><g class="nk-decor"></g></svg>`;
   this.$b=this.el.querySelector('.nk-body');this.$p=this.el.querySelector('.nk-fill');this.$e=this.el.querySelector('.nk-eyes');this.$d=this.el.querySelector('.nk-decor');this.$s=this.el.querySelector('.nk-shadow')}
  set(st){if(!C[st])st='idle';this.st=st;this.t0=performance.now();this.el.dataset.state=st;if(RM.matches)this.frame(performance.now(),true);loop()}
  frame(now,snap){const clip=C[this.st],t=(now-this.t0)/1000;if(clip.next&&t>clip.next[1]){this.set(clip.next[0]);return}
   const tgt=sample(clip,RM.matches?(clip.loop?0:9):t),dt=1/120;
   if(snap||RM.matches){for(const k in BASE)this.pos[k]=tgt[k],this.vel[k]=0}
   else{const steps=Math.min(12,Math.max(1,Math.round(((now-(this.last||now))/1000)/dt)));for(let s=0;s<steps;s++)for(const k in BASE){const kk=k=='ear'||k=='earT'?260:420,c=2*Math.sqrt(kk)*0.72;this.vel[k]+=(kk*(tgt[k]-this.pos[k])-c*this.vel[k])*dt;this.pos[k]+=this.vel[k]*dt}}
   this.last=now;const xt=X[clip.x]||X.neutral,a=RM.matches||snap?1:0.18;for(const k in xt)this.ex[k]+=(xt[k]-this.ex[k])*a;
   const p=this.pos,ex=this.ex,lid=Math.max(tgt.blink,ex.lid);
   this.$b.setAttribute('transform',`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${p.rot.toFixed(2)})`);this.$p.setAttribute('d',outline(p.ear,p.earT,p.sx,p.sy));
   this.$s.setAttribute('rx',(30*(1+p.y/60)).toFixed(1));
   let eyes='';for(const sd of [-1,1]){const [ex0,ey0,z]=eyePos(sd,p.yaw,p.pitch),cx=ex0*p.sx,cy=ey0*p.sy+2,w=ex.w*(0.55+0.45*z),h=ex.h*(1-lid*.9);
    if(ex.arc>0.05)eyes+=`<path d="M${(cx-w/2).toFixed(1)} ${(cy+h*.25).toFixed(1)} Q${cx.toFixed(1)} ${(cy-h*1.1).toFixed(1)} ${(cx+w/2).toFixed(1)} ${(cy+h*.25).toFixed(1)}" class="nk-arc" stroke-width="${(4.2*ex.arc+0.6).toFixed(1)}" opacity="${Math.min(1,ex.arc*1.4).toFixed(2)}"/>`;
    if(ex.arc<0.95)eyes+=`<g opacity="${(1-Math.min(1,ex.arc*1.2)).toFixed(2)}">${pill(cx,cy,w,h,ex.tilt*sd)}</g>`}
   this.$e.innerHTML=eyes;const dc=C[this.st].decor;this.$d.innerHTML=RM.matches?decor(dc,dc=='spark'?0.9:0.4,this.id):decor(dc,t,this.id)}}
 let raf=0;function loop(){if(raf||RM.matches)return;raf=requestAnimationFrame(tick)}
 function tick(now){raf=0;if(document.hidden)return;for(const b of live){if(!b.el.isConnected){live.delete(b);continue}b.frame(now)}if(live.size)loop()}
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)loop()});
 function mountAll(root=document){root.querySelectorAll('.mwrap[data-state]').forEach(el=>{if(!el._nk)new Bot(el)})}
 new MutationObserver(()=>mountAll()).observe(document.documentElement,{childList:true,subtree:true});
 return {mountAll,Bot,states:Object.keys(C)}})();
function mascotSVG(state){return ''}
function mascot(state,text,opts={}){const clean=text?String(text).replace(/<[^>]+>/g,' ').replace(/"/g,'').replace(/\s+/g,' ').trim():'';
 return `<div class="mascot ${opts.small?'small':''} ${opts.row?'row':''}" role="img" aria-label="${MASCOT_NAME}${clean?': '+clean:''}"><div class="mwrap" data-state="${NK_STATES.includes(state)?state:'idle'}"></div>${text?`<div class="bubble">${text}</div>`:''}</div>`}
function moodTo(el,state,text,ms){if(!el)return;const w=el.querySelector('.mwrap');if(w){if(w._nk)w._nk.set(state);else w.dataset.state=state}
 if(text!=null){let b=el.querySelector('.bubble');if(!b){b=document.createElement('div');b.className='bubble';el.appendChild(b)}b.innerHTML=text;b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');el.setAttribute('aria-label',MASCOT_NAME+': '+String(text).replace(/<[^>]+>/g,' ').trim())}
 if(ms){clearTimeout(el._t);el._t=setTimeout(()=>moodTo(el,'idle'),ms)}}
