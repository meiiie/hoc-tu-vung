import asyncio,json,os
from playwright.async_api import async_playwright
B='http://127.0.0.1:18094/app/';O='screens7/';os.makedirs(O,exist_ok=True)
def link(t):os.system(f'ln -sfn {t} /workspace/english/srv/app')
async def main():
 r={};errs=[]
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
  ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True)
  pg=await ctx.new_page();hook=lambda pg:(pg.on('pageerror',lambda e:errs.append(str(e))),pg.on('console',lambda m:m.type=='error' and 'mp3' not in m.text and errs.append(m.text)))
  hook(pg);W=lambda ms=600:pg.wait_for_timeout(ms);E=lambda js:pg.evaluate(js)
  # ---- 1. v6 with progress ----
  link('/workspace/english/v6snap');await pg.goto(B);await W(1200)
  await pg.fill('#nm','Darren');await pg.click('#nx');await W(300);await pg.click('[data-goal="all"]');await pg.click('#nx');await W(300);await pg.click('[data-style="cards"]');await pg.click('#nx');await W(400);await pg.click('#nx');await W(800)
  await E("navigator.serviceWorker.ready")
  r['v6_user']=await E("JSON.parse(localStorage.htv2).user")
  await pg.goto(B+'#/review');await pg.wait_for_selector('#stage .fc');await W(600)
  for g in ['3','3','1']:
    await pg.locator('#stage .fc').tap();await W(500);await pg.click(f'.gbtn[data-g="{g}"]');await W(500)
  await E("(()=>{const d=JSON.parse(localStorage.htv2);const ids=words.slice(0,6).map(w=>w.id);d.learn[ids[0]]=2;d.learn[ids[1]]=2;d.learn[ids[2]]=1;d.learn[ids[3]]=0;localStorage.htv2=JSON.stringify(d)})()")
  v6=await E("JSON.parse(localStorage.htv2)")
  # ---- 2. deploy v7, close and reopen ----
  os.system('cd /workspace/english/hoc-tu-vung && git ls-files -z | xargs -0 touch; touch icons/* mascot.js app.js style.css sw.js');link('/workspace/english/hoc-tu-vung');await pg.goto(B);await W(2500)
  await pg.close();await asyncio.sleep(1.5);pg=await ctx.new_page();hook(pg);W=lambda ms=600:pg.wait_for_timeout(ms);E=lambda js:pg.evaluate(js)
  await pg.goto(B);await W(2500);await pg.reload();await W(1500)
  r['reloads_needed']=0
  while await E("typeof cloze")=='undefined' and r['reloads_needed']<8:
    r['reloads_needed']+=1;await W(1000);await pg.reload();await W(1500)
  r['sw']=await E("caches.keys()");r['diag']=await E("navigator.serviceWorker.getRegistration().then(r=>[r.active&&r.active.scriptURL,!!r.waiting,!!r.installing,typeof SRS,typeof mascotSVG,typeof hardWords,document.title])");r['errs_so_far']=list(errs)
  if r['reloads_needed']>=8:print(json.dumps(r,ensure_ascii=False,indent=1));return
  S=await E("JSON.parse(localStorage.htv2)")
  r['schema']=S['v'];r['srs_kept']=S['srs']==v6['srs'];r['user_kept']=S['user']['name']=='Darren'
  r['learn_migrated']=[S['learn'][k] for k in list(v6['learn'])[:4]]  # expect [4,4,1,0]
  r['log_kept']=S['log']==v6['log'];r['new_fields']=all(k in S for k in ['notes','miss','streak'])
  await pg.wait_for_selector('.today');await W(1200);await pg.screenshot(path=O+'home-light.png',full_page=True)
  # ---- 3. Learn: 4 progressive steps ----
  await E("S.set.f={day:'day01'};S.learn={};S.miss={};save()")
  await pg.goto(B+'#/learn');await W(800)
  seen=set();shots=set();typo_done=ovr_done=False
  for q in range(45):
    if await pg.locator('#nr').count():await pg.click('#nr');await W(500);continue
    if await pg.locator('.res').count():break
    info=await E("(()=>{const o=S.sess.learn,w=byId(o.round[o.ri]);const c=cloze(w);return {id:w.id,a:answerText(w).split(/,\\s*/)[0],cz:c&&c.ans,lv:S.learn[w.id]||0}})()")
    if await pg.locator('.opt').count():
      st=0;seen.add(0)
      if 0 not in shots:await pg.screenshot(path=O+'learn-0-choice.png');shots.add(0)
      await pg.click(f'.opt[data-id="{info["id"]}"]')
    else:
      st=2 if await pg.locator('.cloze').count() else 3 if await pg.locator('#pl').count() else 1
      seen.add(st);ans=info['cz'] if st==2 else info['a']
      if st not in shots:await pg.screenshot(path=O+f'learn-{st}-{["choice","recall","cloze","dictation"][st]}.png');shots.add(st)
      if st==1 and not typo_done and len(ans)>=5 and ' ' not in ans:
        ans=ans[:2]+ans[3]+ans[2]+ans[4:];typo_done=True;await pg.fill('#ti',ans);await pg.click('#ck');await W(500)
        r['typo_near']=await pg.locator('.fb.near').count()==1 and await pg.locator('.diff').count()==1;await pg.screenshot(path=O+'learn-typo-near.png')
        r['typo_advanced']=await E(f"S.learn['{info['id']}']")==2
        await pg.click('#nx');await W(400);continue
      if st==1 and typo_done and not ovr_done:
        ovr_done=True;await pg.fill('#ti','qqqq');await pg.click('#ck');await W(500)
        r['wrong_feedback']=await pg.locator('.fb.bad').count()==1 and await pg.locator('#ovr').count()==1
        r['wrong_dropped_lv']=await E(f"S.learn['{info['id']}']");r['miss_count']=await E(f"S.miss['{info['id']}']")
        await pg.screenshot(path=O+'learn-wrong-diff.png');await pg.click('#ovr');await W(400)
        r['override_lv']=await E(f"S.learn['{info['id']}']");r['override_miss']=await E(f"S.miss['{info['id']}']||0");continue
      await pg.fill('#ti',ans);await pg.click('#ck')
    await W(350);await pg.click('#nx');await W(350)
  r['stages_seen']=sorted(seen)
  r['mastered']=await E("deck().filter(w=>S.learn[w.id]>=4).length")
  r['srs_untouched_by_learn']=await E("JSON.stringify(S.srs)")==json.dumps(v6['srs'],separators=(',',':')) or (await E("Object.keys(S.srs).length"))==len(v6['srs'])
  # ---- 4. Difficult words ----
  await E("const w=deck()[3];S.miss[w.id]=2;save()")
  await pg.goto(B+'#/');await W(800);r['hard_card']=await pg.text_content('[data-go="hard"] small')
  await pg.goto(B+'#/hard');await W(800);await pg.screenshot(path=O+'hard-words.png')
  r['hard_started']=await pg.locator('#ti').count()==1
  # ---- 5. mnemonic note on the card back ----
  await pg.goto(B+'#/cards');await W(900);await pg.locator('.fc').first.tap();await W(700)
  fl=await pg.locator('.fc.flip').count();await pg.locator('.fc.flip .face.back [data-note], .fc.flip [data-note]').first.tap();await W(500)
  await pg.fill('#nt','Nghĩ tới hình ảnh để nhớ');await pg.click('#nsave');await W(500)
  r['note_saved']=await E("Object.values(S.notes)[0]")=='Nghĩ tới hình ảnh để nhớ';r['card_still_flipped']=fl==1 and await pg.locator('.fc.flip').count()==1
  await pg.screenshot(path=O+'card-note.png')
  # ---- 6. streak freeze ----
  await E("(()=>{S.log={};for(let k=2;k<=9;k++)S.log[addDays(today(),-k)]={rev:5,new:1};S.streak={freeze:1,frozen:[],earned:''};save()})()")
  await pg.goto(B+'#/');await W(900)
  r['freeze_used']=await E("S.streak.frozen.includes(addDays(today(),-1))&&S.streak.freeze==0");r['streak_after_freeze']=await E("streakNow()")
  await pg.screenshot(path=O+'home-freeze.png',full_page=True)
  await E("(()=>{S.log={};for(let k=1;k<=6;k++)S.log[addDays(today(),-k)]={rev:5,new:1};S.streak={freeze:0,frozen:[],earned:''};save()})()")
  await pg.goto(B+'#/listen');await W(900);await pg.fill('#ti','x');await pg.click('#ck');await W(500)
  r['freeze_earned_at_7']=await E("[streakNow(),S.streak.freeze]")
  await E("S.log={};save()");await pg.goto(B+'#/');await W(500)
  r['no_freeze_no_streak']=await E("streakNow()")
  # ---- 7. daily goal setting ----
  await pg.click('#settings');await W(500);await pg.click('[data-set="goalAns"][data-v="50"]');await W(300);await pg.screenshot(path=O+'settings.png')
  await pg.keyboard.press('Escape');await W(300);await pg.goto(B+'#/stats');await pg.goto(B+'#/');await W(600)
  r['goal_text']=(await pg.text_content('.today .num')).strip()
  # ---- 8. dark mode + offline ----
  await E("S.set.theme='dark';save();applyTheme()");await pg.goto(B+'#/');await W(1200);await pg.screenshot(path=O+'home-dark.png',full_page=True)
  await pg.goto(B+'#/learn');await W(900);await pg.screenshot(path=O+'learn-dark.png')
  await E("S.set.theme='light';save();applyTheme()")
  await ctx.set_offline(True);await pg.goto(B+'#/');await pg.reload();await W(1500);r['offline_loads']=await pg.locator('.today').count()>0;await ctx.set_offline(False)
  r['errors']=errs;print(json.dumps(r,ensure_ascii=False,indent=1))
asyncio.run(main())
