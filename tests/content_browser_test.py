"""Integration checks against the compiled snapshot in an isolated Chromium profile."""
import functools
import http.server
import json
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/audits'


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


def main():
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}/'
    errors, result = [], {}
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        page = context.new_page()
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.add_init_script("""if(!localStorage.getItem('fixture-set')){
          localStorage.setItem('htv2',JSON.stringify({v:7,user:{name:'Kiểm thử',done:true,goal:'10'},
            notes:{'p1-013':'Ghi chú cần giữ'},star:{'p1-013':true},set:{autoplay:false},
            srs:{'p1-013':{algo:'fsrs',state:'review',s:12,d:5,due:2000000000000,last:1700000000000,reps:7,lapses:1}}}));
          localStorage.setItem('fixture-set','1')}
        """)
        page.goto(base, wait_until='networkidle')
        page.wait_for_function('words.length === 4971 && PRON !== null')
        result['boot'] = page.evaluate("({words:words.length, schema:S.v, storage:ProgressStore.mode, oldNote:S.notes['p1-013'], oldReps:S.srs['p1-013'].reps, pages:pages.length})")
        assert result['boot'] == {'words': 4971, 'schema': 11, 'storage': 'IndexedDB', 'oldNote': 'Ghi chú cần giữ', 'oldReps': 7, 'pages': 20}
        assert page.evaluate("words.every(w=>pronVars(w).length && cloze(w))")
        page.evaluate("openFilter()")
        page.locator('#f-day').select_option('')
        page.locator('.filter-extra summary').click()
        page.locator('[data-k="cefr"][data-v="C1"]').click()
        page.locator('#fdone').click()
        result['c1'] = page.evaluate("({count:deck().length,all:deck().every(w=>w.cefr.includes('C1'))})")
        assert result['c1']['count'] > 500 and result['c1']['all']
        page.evaluate("S.set.f={};location.hash='#/list'")
        page.locator('#sq').wait_for()
        assert page.locator('#ls .it').count() == 100
        page.locator('#more').click()
        assert page.locator('#ls .it').count() == 200
        page.locator('#sq').fill('virtual')
        page.wait_for_function("document.querySelector('#ls').textContent.includes('virtual') && document.querySelectorAll('#ls .it').length < 20")
        page.locator('#ls [data-w]').first.click()
        page.locator('#sheet .meanings summary').click()
        assert page.locator('#sheet .meanings[open]').count() == 1
        assert page.locator('#sheet .meanings li').count() > 0
        page.screenshot(path=str(OUT / 'content-word-mobile.png'), full_page=True)
        page.keyboard.press('Escape')
        result['dictionary'] = 'search, pagination, extended meanings and source links passed'

        for route in ['cards', 'review', 'learn', 'listen', 'speak', 'match', 'test', 'stats']:
            page.evaluate('(route)=>{location.hash="#/"+route}', route)
            page.wait_for_function('(route)=>document.querySelector(".v-"+route)', arg=route)
        page.evaluate("location.hash='#/review'")
        page.locator('#show').wait_for()
        cid = page.evaluate('S.sess.review.cur')
        page.locator('#show').click()
        page.locator('[data-g="3"]').click()
        page.wait_for_function('(cid)=>!!S.srs[cid]', arg=cid)
        result['scheduledReview'] = 'answer persisted'
        page.evaluate("location.hash='#/cards'")
        page.locator('.fc').wait_for()
        page.evaluate("document.querySelector('.fc').classList.add('flip')")
        page.locator('.fc .meanings summary').click()
        assert page.locator('.fc.flip .meanings[open]').count() == 1

        audio = page.evaluate("words.find(w=>w.w==='virtual').audio")
        for voice in ['gb', 'us']:
            for kind in ['w', 'ex']:
                duration = page.evaluate("""url=>new Promise((resolve,reject)=>{
                  const a=new Audio(url);a.onloadedmetadata=()=>resolve(a.duration);a.onerror=()=>reject(new Error(url));
                })""", audio[voice][kind])
                assert duration > 0.15
        result['audioPlaybackMetadata'] = 'UK/US word and example decode in browser'

        added_audio = page.evaluate("""()=>{
          const names=['blank','CD','chairman','disc','DVD','gentleman','policeman','sculpture','stiff','tape'];
          return names.map(name=>{
            const w=words.find(w=>w.w===name);
            if(!w||!cloze(w)||!w.exvi||!w.vi||!pronVars(w).length)throw new Error('Incomplete addition: '+name);
            return {name,urls:Object.values(w.audio).flatMap(v=>Object.values(v))};
          });
        }""")
        assert len(added_audio)==10
        new_urls=[url for entry in added_audio for url in entry['urls']]
        assert len(new_urls)==len(set(new_urls))==40
        durations=page.evaluate("""urls=>Promise.all(urls.map(url=>new Promise((resolve,reject)=>{
          const a=new Audio(url);a.onloadedmetadata=()=>resolve(a.duration);a.onerror=()=>reject(new Error(url));
        })))""",new_urls)
        assert all(t>0.15 for t in durations)
        assert page.evaluate("dayIndex.get('day199').wordIds.length===21 && dayIndex.get('day199').ids.has(words.find(w=>w.w==='DVD').id)")
        page.evaluate("S.set.f={day:''};location.hash='#/list'")
        page.locator('#sq').fill('sculpture')
        page.wait_for_function("document.querySelector('#ls').textContent.includes('sculpture')")
        page.locator('#ls [data-w]').first.click()
        assert 'tác phẩm điêu khắc' in page.locator('#sheet').inner_text().lower()
        page.screenshot(path=str(OUT/'pdf-addition-word-mobile.png'),animations='disabled')
        page.keyboard.press('Escape')
        result['pdfAdditions']={'words':10,'decodedAudio':len(durations),'lastDaySize':21}

        page.evaluate("""async()=>{
          await navigator.serviceWorker.ready;
          await (await caches.open('unrelated-cache')).put('unrelated.txt',new Response('keep'));
          S.notes['p20-209']='x'.repeat(8_000_000);
          if(!await save())throw new Error('large save failed');
        }""")
        page.reload(wait_until='networkidle')
        page.wait_for_function('words.length === 4971')
        assert page.evaluate("S.notes['p20-209'].length") == 8_000_000
        assert page.evaluate("S.notes['p1-013']") == 'Ghi chú cần giữ'
        result['largeProgress'] = '8 MB payload survives reload; original notes and cards retained'
        page.on('dialog', lambda dialog: dialog.accept())
        page.evaluate("""async()=>{
          const incoming=structuredClone(S);incoming.notes['p1-013']='Đã nhập từ bản sao lưu';
          const file=new File([JSON.stringify({app:'hoc-tu-vung',data:incoming})],'backup.json',{type:'application/json'});
          await importProgress(file);
        }""")
        assert page.evaluate("S.notes['p1-013']") == 'Đã nhập từ bản sao lưu'
        assert page.evaluate("S.notes['p20-209'].length") == 8_000_000
        page.evaluate("""async()=>{
          const original=ProgressStore.save;
          ProgressStore.save=()=>Promise.reject(new Error('simulated storage failure'));
          try{await importProgress(new File([JSON.stringify({user:{done:true},notes:{'p1-013':'MUST NOT REPLACE'}})],'failed.json'))}
          finally{ProgressStore.save=original}
        }""")
        assert page.evaluate("S.notes['p1-013']") == 'Đã nhập từ bản sao lưu'
        result['import'] = '8 MB backup imported; failed persistence leaves current progress unchanged'
        page.evaluate("""async()=>{
          delete S.notes['p20-209']; await save();
          const cache=await caches.open(AUDIO_CACHE);
          for(const voice of ['gb','us'])await Content.downloadAudio([words.find(w=>w.w==='virtual')],voice,cache);
          const added=words.filter(w=>w.references.some(r=>r.source==='oxford3000-pdf-20200706'));
          for(const voice of ['gb','us'])await Content.downloadAudio(added,voice,cache);
        }""")
        context.set_offline(True)
        page.reload(wait_until='networkidle')
        page.wait_for_function('words.length === 4971 && PRON !== null')
        result['offline'] = page.evaluate("""async()=>{
          const cache=await caches.open('htv-v24');
          const packs=await Promise.all(pages.map(p=>cache.match(p.file)));
          const url=words.find(w=>w.w==='virtual').audio.gb.w;
          const partial=await fetch(url,{headers:{Range:'bytes=0-1'}});
          return {words:words.length,packs:packs.filter(Boolean).length,rangeStatus:partial.status,rangeBytes:(await partial.arrayBuffer()).byteLength,otherCache:await caches.has('unrelated-cache')};
        }""")
        assert result['offline'] == {'words': 4971, 'packs': 20, 'rangeStatus': 206, 'rangeBytes': 2, 'otherCache': True}
        assert page.evaluate("""async urls=>{
          const responses=await Promise.all(urls.map(url=>fetch(url)));
          return responses.every(r=>r.ok);
        }""",new_urls)
        result['pdfAdditions']['offlineAudio']=40
        page.evaluate("location.hash='#/list'")
        page.locator('#sq').fill('technology')
        page.wait_for_function("document.querySelector('#ls').textContent.includes('technology')")
        page.screenshot(path=str(OUT / 'content-offline-mobile.png'), full_page=True)
        context.set_offline(False)
        desktop = browser.new_page(viewport={'width': 1440, 'height': 900})
        desktop.on('pageerror', lambda e: errors.append(str(e)))
        desktop.add_init_script("localStorage.setItem('htv2',JSON.stringify({v:11,user:{done:true,name:'Desktop'},set:{autoplay:false,f:{day:''}}}))")
        desktop.goto(base+'#/list', wait_until='networkidle')
        desktop.locator('#ls .it').first.wait_for()
        assert desktop.locator('#ls .it').count() == 100
        desktop.locator('#ls [data-w]').first.click()
        desktop.locator('#sheet .meanings summary').click()
        assert desktop.locator('#sheet .meanings[open]').count() == 1
        desktop.screenshot(path=str(OUT / 'content-word-desktop.png'), full_page=False)
        result['desktop'] = 'paginated list opens full word details'
        result['pageErrors'] = errors
        assert not errors, errors
        browser.close()
    server.shutdown()
    (OUT / 'content-browser-2026-10-26.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
