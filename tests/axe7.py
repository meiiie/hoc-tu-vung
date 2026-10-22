import asyncio,json
from playwright.async_api import async_playwright
U='http://127.0.0.1:18093/';AX=open('/tmp/axe/node_modules/axe-core/axe.min.js').read()
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  out={}
  for scheme in ['light','dark']:
   ctx=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,color_scheme=scheme);pg=await ctx.new_page()
   await pg.goto(U);await pg.wait_for_timeout(1000)
   if await pg.locator('#nm').count():
    await pg.fill('#nm','A');
    for i in range(4):await pg.click('#nx');await pg.wait_for_timeout(300)
   await pg.evaluate("S.miss[words[3].id]=2;S.notes[words[0].id]='note';S.streak.freeze=1;S.log[addDays(today(),-1)]={rev:3,new:1};save()")
   for route in ['','#/cards','#/review','#/stats','#/list','#/learn','#/listen','#/speak','#/test','#/hard','LEARNFB','CLOZE','NOTE','SETTINGS']:
    if route=='SETTINGS':await pg.goto(U);await pg.wait_for_timeout(800);await pg.click('#settings')
    elif route=='LEARNFB':
     await pg.evaluate("S.sess={};S.learn={};save()");await pg.goto(U+'#/learn');await pg.wait_for_timeout(800);await pg.click('.opt');await pg.wait_for_timeout(300)
    elif route=='CLOZE':
     await pg.evaluate("(()=>{S.sess={};S.learn={};S.set.f={day:'day01'};for(const w of deck())S.learn[w.id]=cloze(w)?2:4;save()})()");await pg.goto(U+'#/');await pg.goto(U+'#/learn');await pg.wait_for_timeout(800);await pg.fill('#ti','wrng');await pg.click('#ck')
    elif route=='NOTE':
     await pg.evaluate("S.set.f={};save()");await pg.goto(U+'#/cards');await pg.wait_for_timeout(900);await pg.locator('.fc').first.click();await pg.wait_for_timeout(700);await pg.locator('.fc.flip [data-note]').first.click()
    else:await pg.goto(U+route)
    await pg.wait_for_timeout(1200);await pg.add_script_tag(content=AX)
    res=await pg.evaluate("axe.run(document,{runOnly:['wcag2a','wcag2aa','wcag21aa','best-practice']}).then(r=>r.violations.map(v=>[v.id,v.impact,v.nodes.length,v.nodes.slice(0,2).map(n=>n.target.join(' ')+' :: '+(n.failureSummary||'').slice(0,140))]))")
    if res:out[scheme+':'+(route or 'home')]=res
   await ctx.close()
  print(json.dumps(out,indent=1,ensure_ascii=False))
asyncio.run(main())
