import sys,asyncio,json,os,time
from playwright.async_api import async_playwright
B='http://127.0.0.1:18094/app/';O='screens6/'
os.makedirs(O,exist_ok=True)
def link(t):os.system(f'ln -sfn {t} /workspace/english/srv/app')
async def main():
 global R_,E_
 r={};errs=[];R_=r;E_=errs
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
  ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True,accept_downloads=True)
  pg=await ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
  W=lambda ms=600:pg.wait_for_timeout(ms)
  # ---- 1. v5 install with progress ----
  link('/workspace/english/v5snap')
  await pg.goto(B);await W(1200)
  await pg.fill('#nm','Darren');await pg.click('#nx');await W(300);await pg.click('[data-goal="all"]');await pg.click('#nx');await W(300);await pg.click('[data-style="cards"]');await pg.click('#nx');await W(300);await pg.click('#nx');await pg.wait_for_selector('.today')
  await pg.evaluate("navigator.serviceWorker.ready")
  # make SM-2 progress in v5 by reviewing 3 cards
  await pg.goto(B+'#/review');await pg.wait_for_selector('#show')
  for g in ['4','4','0']:
    await pg.click('#show');await W(300);await pg.click(f'[data-g="{g}"]');await W(400)
  v5=await pg.evaluate("JSON.parse(localStorage.htv2)");r['v5_srs_count']=len(v5['srs']);r['v5_sw']=await pg.evaluate("fetch('sw.js').then(r=>r.text()).then(t=>t.match(/htv-v\\d+/)[0])")
  # ---- 2. deploy v6 at same origin, reload ----
  link('/workspace/english/hoc-tu-vung')
  await pg.goto(B);await W(2500)
  r['v5_page_after_deploy_waiting']=await pg.evaluate("navigator.serviceWorker.getRegistration().then(r=>!!r.waiting)")
  # user closes and reopens the app -> waiting v6 worker takes over
  await pg.close();await asyncio.sleep(1.5);pg=await ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)))
  await pg.goto(B);await W(2500);await pg.reload();await W(1500)
  r['sw_ctrl']=await pg.evaluate("fetch('sw.js').then(r=>r.text()).then(t=>t.match(/htv-v\\d+/)[0])")
  r['sw_after']=await pg.evaluate("caches.keys()")
  S=await pg.evaluate("JSON.parse(localStorage.htv2)")
  r['progress_kept']=all(k in S['srs'] for k in v5['srs']) and S['user']['name']=='Darren'
  r['schema']=S.get('v');r['migrated_states']=sorted({c.get('state') for c in S['srs'].values()})
  r['ef_int_preserved']=all(S['srs'][k]['int']==v5['srs'][k]['int'] and S['srs'][k]['due']==v5['srs'][k]['due'] for k in v5['srs'])
  await pg.wait_for_selector('.today');await W(800);await pg.screenshot(path=O+'home.png',full_page=True)
  # ---- 3. review engine ----
  await pg.goto(B+'#/review');await pg.wait_for_selector('#show');await W(500)
  await pg.screenshot(path=O+'dbg.png');r['counts0']=await pg.text_content('.qcounts');await pg.click('#show');await W(500)
  r['labels']=await pg.evaluate("[...document.querySelectorAll('.gbtn')].map(b=>b.innerText.replace(/\\n/g,' '))")
  await pg.screenshot(path=O+'review-grades.png')
  cid1=await pg.evaluate("JSON.parse(localStorage.htv2).sess.review.cur")
  await pg.click('[data-g="3"]');await W(500)
  cid2=await pg.evaluate("JSON.parse(localStorage.htv2).sess.review.cur");r['advanced']=cid1!=cid2
  st=await pg.evaluate(f"JSON.parse(localStorage.htv2).srs['{cid1}']");r['answered_state']=st['state'];r['fsrs_fields']=('s' in st and 'd' in st)
  r['sibling_buried']=cid2!=cid1+'~r'
  # undo
  await pg.click('#undo');await W(600);r['undo_restores']=await pg.evaluate("JSON.parse(localStorage.htv2).sess.review.cur")==cid1
  # flip + reload restore
  await pg.goto(B+'#/review');await pg.wait_for_selector('#stage .fc');await W(400)
  before=await pg.evaluate("[JSON.parse(localStorage.htv2).sess.review.cur,document.querySelector('.fc').classList.contains('flip')]")
  await pg.reload();await pg.wait_for_selector('#stage .fc');await W(600)
  after=await pg.evaluate("[JSON.parse(localStorage.htv2).sess.review.cur,document.querySelector('.fc').classList.contains('flip')]")
  r['review_reload_restore']=before==after;r['review_reload_detail']=[before,after]
  # learn steps: Again then it reappears within session (learn-ahead)
  await pg.locator('#show:not(.hidden)').count() and await pg.click('#show');await W(300);cidA=await pg.evaluate("JSON.parse(localStorage.htv2).sess.review.cur");await pg.click('[data-g="1"]');await W(400)
  r['again_card_state']=await pg.evaluate(f"JSON.parse(localStorage.htv2).srs['{cidA}'].state")
  # ---- 4. flashcards reload restore ----
  await pg.goto(B+'#/cards');await pg.wait_for_selector('.fc');await W(500)
  for i in range(3):await pg.click('#nK');await W(450)
  await pg.click('#flipb');await W(700)
  fb=await pg.evaluate("[document.querySelector('.hint').innerText,document.querySelector('.fc').classList.contains('flip')]")
  await pg.reload();await pg.wait_for_selector('.fc');await W(700)
  fa=await pg.evaluate("[document.querySelector('.hint').innerText,document.querySelector('.fc').classList.contains('flip')]")
  r['cards_reload_restore']=fb==fa;r['cards_detail']=fa[0][:12]
  await pg.goto(B);await pg.wait_for_selector('.today');await W(500);r['resume_banner']=await pg.locator('#resume').count()
  # ---- 5. listen restore ----
  await pg.goto(B+'#/listen');await pg.wait_for_selector('#ti');await pg.click('#dk');await W(300);await pg.click('#nx');await W(300)
  lb=await pg.text_content('.prog span');await pg.reload();await pg.wait_for_selector('#ti');await W(400);r['listen_restore']=lb==await pg.text_content('.prog span')
  # ---- 6. stats / settings ----
  await pg.goto(B+'#/stats');await pg.wait_for_selector('.heat');await W(400);await pg.screenshot(path=O+'stats.png',full_page=True)
  await pg.goto(B);await pg.wait_for_selector('.today');await W(600);print('PRE',await pg.evaluate("[window._swipeT,performance.now(),(()=>{const r=document.querySelector('#settings').getBoundingClientRect();const e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return e.id||e.className.baseVal||e.className})(),typeof openSettings,String(document.querySelector('#settings').onclick).slice(0,40)]"));await pg.click('#settings');await W(500);await pg.screenshot(path=O+'settings.png',full_page=True);print('SHEET',await pg.evaluate("document.querySelector('#sheet').className+' '+document.querySelector('#sheet').innerText.slice(0,80)"))
  async with pg.expect_download() as dl:await pg.click('#exp')
  d=await dl.value;path=O+'backup.json';await d.save_as(path);j=json.load(open(path));r['export_ok']=j['app']=='hoc-tu-vung' and len(j['data']['srs'])>=3
  # wipe and import
  await pg.evaluate("localStorage.clear()");await pg.reload();await W(1200)
  await pg.fill('#nm','X');await pg.click('#nx');await W(300);await pg.click('#nx');await W(300);await pg.click('#nx');await W(300);await pg.click('#nx');await pg.wait_for_selector('.today')
  await pg.click('#settings');await W(400);pg.once('dialog',lambda dg:asyncio.ensure_future(dg.accept()))
  await pg.set_input_files('#impf',path);await W(800)
  S2=await pg.evaluate("JSON.parse(localStorage.htv2)");r['import_ok']=S2['user']['name']=='Darren' and len(S2['srs'])==len(j['data']['srs'])
  # corrupt storage recovery
  await pg.evaluate("localStorage.htv2='{broken'");await pg.reload();await W(1200)
  r['corrupt_recovered_from_bak']=await pg.evaluate("(()=>{const s=JSON.parse(localStorage.htv2);return !!(s.user&&s.user.name)})()")
  r['corrupt_kept_copy']=await pg.evaluate("Object.keys(localStorage).some(k=>k.startsWith('htv2-corrupt-'))")
  # ---- update prompt v6 -> v6b ----
  os.system("cd /workspace/english/hoc-tu-vung && cp sw.js /tmp/sw.bak && echo '//test-bump' >> sw.js")
  await pg.goto(B);await W(1500);await pg.evaluate("navigator.serviceWorker.getRegistration().then(r=>r.update())");await W(2500)
  r['update_toast']=await pg.evaluate("document.querySelector('#toast').innerText");await pg.screenshot(path=O+'update-toast.png')
  srs_before=await pg.evaluate("localStorage.htv2")
  if await pg.locator('.tact').count():
    await pg.click('.tact');await W(3000)
  r['after_update_reload_same_progress']=await pg.evaluate("localStorage.htv2")==srs_before
  r['new_sw_active']=await pg.evaluate("navigator.serviceWorker.controller&&fetch('sw.js').then(r=>r.text()).then(t=>t.includes('test-bump'))")
  os.system("cp /tmp/sw.bak /workspace/english/hoc-tu-vung/sw.js")
  # offline
  await ctx.set_offline(True);await pg.reload();await W(1500);r['offline_loads']=await pg.locator('.today').count()>0;await ctx.set_offline(False)
  r['errors']=[e for e in errs if 'Failed to load resource' not in e]
  print(json.dumps(r,indent=1,ensure_ascii=False));await b.close()
async def safe():
 try:await main()
 except Exception as e:print('FAIL',str(e)[:300]);print(json.dumps(R_,indent=1,ensure_ascii=False));print(E_)
asyncio.run(safe())
