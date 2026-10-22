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
   for route in ['','#/cards','#/review','#/stats','#/list','#/learn','#/listen','#/speak','#/test','SETTINGS']:
    if route=='SETTINGS':await pg.goto(U);await pg.wait_for_timeout(800);await pg.click('#settings')
    else:await pg.goto(U+route)
    await pg.wait_for_timeout(1200);await pg.add_script_tag(content=AX)
    res=await pg.evaluate("axe.run(document,{runOnly:['wcag2a','wcag2aa','wcag21aa','best-practice']}).then(r=>r.violations.map(v=>[v.id,v.impact,v.nodes.length,v.nodes.slice(0,2).map(n=>n.target.join(' ')+' :: '+(n.failureSummary||'').slice(0,140))]))")
    if res:out[scheme+':'+(route or 'home')]=res
   await ctx.close()
  print(json.dumps(out,indent=1,ensure_ascii=False))
asyncio.run(main())
