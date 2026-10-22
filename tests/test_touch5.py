import sys,asyncio,json
from playwright.async_api import async_playwright
URL=sys.argv[1];O=sys.argv[2]
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
  ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True)
  pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  await pg.goto(URL);await pg.wait_for_timeout(1200)
  if await pg.locator('#nm').count():
    await pg.fill('#nm','T');await pg.click('#nx');await pg.wait_for_timeout(300);await pg.click('[data-goal="all"]');await pg.click('#nx');await pg.wait_for_timeout(300);await pg.click('[data-style="speak"]');await pg.click('#nx');await pg.wait_for_timeout(300);await pg.click('#nx');await pg.wait_for_selector('.today')
  cdp=await ctx.new_cdp_session(pg);r={}
  async def touch(pts,dt=16):
    await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':pts[0][0],'y':pts[0][1]}]})
    for x,y in pts[1:]:
      await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x,'y':y}]});await pg.wait_for_timeout(dt)
    await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});await pg.wait_for_timeout(700)
  flipped="document.querySelector('.fc').classList.contains('flip')"
  word="document.querySelector('.fc .face.f').innerText"
  await pg.goto(URL+'#/cards');await pg.wait_for_timeout(1500);print(errs,await pg.evaluate('location.hash'));await pg.screenshot(path=O+'-dbg.png');await pg.wait_for_selector('.fc');await pg.wait_for_timeout(800)
  bb=await pg.locator('.face.f [data-au]').bounding_box();ax,ay=bb['x']+bb['width']/2,bb['y']+bb['height']/2
  await touch([(ax,ay)]);r['tap_audio_flipped']=await pg.evaluate(flipped);r['audio_playing_class']=await pg.evaluate("!!document.querySelector('.ib.playing')");await pg.screenshot(path=O+'-audio-tap.png')
  sb=await pg.locator('.face.f [data-star]').bounding_box();await touch([(sb['x']+sb['width']/2,sb['y']+sb['height']/2)]);r['tap_star_flipped']=await pg.evaluate(flipped)
  box=await pg.locator('.fc').bounding_box();cx,cy=box['x']+box['width']/2,box['y']+box['height']/2+40
  await touch([(cx,cy+i*12) for i in range(-6,7)]);r['vertical_drag_flipped']=await pg.evaluate(flipped)
  await touch([(cx,cy),(cx+4,cy+3)]);r['tap_flips']=await pg.evaluate(flipped);await pg.screenshot(path=O+'-tap-flip.png')
  # scroll inside back face, then tap back audio
  await touch([(cx,cy+60-i*15) for i in range(10)]);r['scroll_back_still_flipped']=await pg.evaluate(flipped)
  bb=await pg.locator('.face.b [data-au]').first.bounding_box()
  await touch([(bb['x']+bb['width']/2,bb['y']+bb['height']/2)]);r['tap_back_audio_still_flipped']=await pg.evaluate(flipped)
  await touch([(cx,cy),(cx+1,cy)]);r['tap_unflip']=not await pg.evaluate(flipped)
  w0=await pg.evaluate(word);await touch([(cx-100+i*25,cy) for i in range(12)])
  r['swipe_navigated']=await pg.evaluate(word)!=w0;r['new_card_flipped']=await pg.evaluate(flipped);await pg.screenshot(path=O+'-after-swipe.png')
  w0=await pg.evaluate(word);await touch([(cx,cy),(cx+40,cy),(cx+60,cy)],60);r['short_swipe_snapback_same']=await pg.evaluate(word)==w0;r['short_swipe_flipped']=await pg.evaluate(flipped)
  await pg.keyboard.press('Space');await pg.wait_for_timeout(600);r['space_flip']=await pg.evaluate(flipped)
  w0=await pg.evaluate(word);await pg.keyboard.press('ArrowRight');await pg.wait_for_timeout(600);r['arrow_nav']=await pg.evaluate(word)!=w0
  # review mode: tap audio no flip, swipe right = Good (answers card), tap flips
  await pg.goto(URL+'#/review');await pg.wait_for_selector('#stage .fc');await pg.wait_for_timeout(700)
  if await pg.locator('#stage .fc.flip').count()==0:
    bb=await pg.locator('.face.f [data-au]').bounding_box()
    if bb:
      await touch([(bb['x']+bb['width']/2,bb['y']+bb['height']/2)]);r['review_tap_audio_flipped']=await pg.evaluate(flipped)
    box=await pg.locator('.fc').bounding_box();cx,cy=box['x']+box['width']/2,box['y']+box['height']/2+40
    await touch([(cx,cy),(cx+2,cy+2)]);r['review_tap_flips_and_shows_grades']=await pg.evaluate("document.querySelector('.fc').classList.contains('flip')&&!document.querySelector('#gr').classList.contains('hidden')")
  c0=await pg.evaluate("JSON.parse(localStorage.htv2).sess.review.cur");await touch([(cx-100+i*25,cy) for i in range(12)])
  r['review_swipe_answers']=await pg.evaluate("JSON.parse(localStorage.htv2).sess.review.cur")!=c0 and await pg.evaluate(f"!!JSON.parse(localStorage.htv2).srs['{c0}']")
  r['sw']=await pg.evaluate("fetch('sw.js').then(r=>r.text()).then(t=>t.match(/htv-v\\d+/)[0])");r['errors']=errs
  print(json.dumps(r,indent=1));await b.close()
asyncio.run(main())
