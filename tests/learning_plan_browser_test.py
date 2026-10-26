"""Study-day selection, real scheduling, migration and offline in an isolated profile."""
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


def answer(page, rating='4'):
    page.locator('#show').click()
    page.locator(f'[data-g="{rating}"]').click()


def select_day(page, day, from_review=False):
    page.locator('#change-day' if from_review else '#filt').click()
    page.locator('#f-day').select_option(day)
    page.locator('#fdone').click()


def main():
    server = http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    errors, result = [], {}
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,timezone_id='Asia/Ho_Chi_Minh')
        page = context.new_page()
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.add_init_script("""if(!localStorage.getItem('fixture-set')){
          localStorage.setItem('htv2',JSON.stringify({v:10,user:{name:'ga',done:true,goal:'10'},
            migrationV9:{goal:'all',filter:{day:'day01'}},introductions:{'p1-013':0},
            set:{f:{},rev:true,autoplay:false,goalAns:100},notes:{'p1-013':'Giữ ghi chú'},
            srs:{'p1-013':{algo:'fsrs',state:'review',s:12,d:5,due:2000000000000,last:1700000000000,reps:7,lapses:1}}}));
          localStorage.setItem('fixture-set','1')}
        """)
        page.goto(f'http://127.0.0.1:{server.server_port}/#/')
        page.locator('.v-home').wait_for()
        baseline = page.evaluate("({total:words.length,selected:deck().length,days:studyDays.length,last:studyDays.at(-1).wordIds.length,filter:F(),goal:newPerDay(),schema:S.v})")
        assert baseline=={'total':4971,'selected':25,'days':199,'last':21,'filter':{'day':'day01'},'goal':25,'schema':11}, baseline
        assert page.locator('[data-day]').count()==199
        assert page.evaluate("S.notes['p1-013']==='Giữ ghi chú' && S.srs['p1-013'].reps===7")
        assert page.locator('#path-open, .path-summary, [data-lesson]').count()==0
        assert 'Lộ trình' not in page.locator('#app').inner_text()
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        result['migrationAndCoverage']=baseline
        page.screenshot(path=str(OUT/'study-days-home-mobile.png'),full_page=True,animations='disabled')

        # An untouched group can be finished, then another chosen immediately.
        page.locator('[data-day="day02"]').click()
        assert page.evaluate('counts(allCards(words)).n')==25
        page.locator('[data-go="review"]').click()
        page.locator('#show').wait_for()
        first=page.evaluate('S.sess.review.cur')
        answer(page)
        page.locator('#undo').click()
        assert page.evaluate('selectedUsage().words')==0
        assert page.evaluate('(id)=>!introduced(id)',first)
        page.locator('[data-g="4"]').click()
        for _ in range(24):
            answer(page)
        page.locator('#change-day').wait_for()
        assert page.evaluate('selectedUsage().words')==25
        assert page.evaluate('counts(allCards(words)).n')==0
        page.evaluate("window.day2Schedule=JSON.stringify(Object.fromEntries(selectedDay().wordIds.map(id=>[id,S.srs[id]])))")
        select_day(page,'day03',from_review=True)
        page.locator('#show').wait_for()
        assert page.evaluate('selectedDay().ids.has(S.sess.review.cur)')
        assert page.evaluate('counts(allCards(words)).n')==25
        answer(page)
        answer(page)
        assert page.evaluate('studyUsage().words')==27
        assert page.evaluate('selectedUsage().words')==2
        page.evaluate("location.hash='#/'")
        page.locator('[data-day="day02"]').click()
        assert page.evaluate('counts(allCards(words)).n')==0
        assert page.evaluate('JSON.stringify(Object.fromEntries(selectedDay().wordIds.map(id=>[id,S.srs[id]])))===day2Schedule')
        page.reload()
        page.locator('.v-home').wait_for()
        assert page.evaluate('selectedUsage().words')==25
        assert page.evaluate('studyUsage().words')==27
        result['sameDayExtraGroup']='25 distinct words in day02, 2 in day03 today; undo, return, reload retain counts and schedules'

        select_day(page,'day03')
        page.locator('#settings').click()
        assert page.locator('[data-set="goal"][data-v="50"]').count()==0
        page.locator('[data-set="goal"][data-v="10"]').click()
        page.keyboard.press('Escape')
        assert page.evaluate('counts(allCards(words)).n')==8
        page.evaluate("S.star[deck().find(w=>!introduced(w.id)).id]=true")
        page.locator('#filt').click()
        page.locator('#f-st').check()
        assert page.evaluate('selectedUsage().words')==2
        page.locator('#f-st').uncheck()
        page.locator('#fdone').click()
        assert page.evaluate('counts(allCards(words)).n')==8
        result['groupBudget']='smaller pace is scoped to the group; narrower filters do not reset its usage'

        page.locator('#settings').click()
        page.locator('[data-set="goal"][data-v="25"]').click()
        page.screenshot(path=str(OUT/'study-days-settings-mobile.png'),full_page=True,animations='disabled')
        page.keyboard.press('Escape')
        select_day(page,'day199')
        assert page.evaluate('deck().length')==21
        assert page.evaluate('counts(allCards(words)).n')==21
        assert page.locator('[data-day="day199"]').get_attribute('aria-pressed')=='true'
        assert page.evaluate("(()=>{const a=document.querySelector('[data-day=day199]').getBoundingClientRect(),r=document.querySelector('.day-strip').getBoundingClientRect();return a.left>=r.left-1&&a.right<=r.right+1})()")
        page.locator('#filt').click()
        assert page.locator('#f-day option').count()==200
        page.screenshot(path=str(OUT/'study-days-filter-mobile.png'),full_page=True,animations='disabled')
        page.locator('#fdone').click()
        page.locator('[data-go="learn"]').click()
        page.wait_for_function('!!S.sess.learn?.round')
        assert page.evaluate('S.sess.learn.round.every(id=>selectedDay().ids.has(id))')
        result['lastGroup']='day199 has 21 words; quick selector reaches every group, learning stays inside selected scope'

        # Reviews remain eligible even when the selected practice group is empty.
        page.evaluate("""()=>{
          window.outside='p1-013';S.srs[outside].due=Date.now()-1000;
          S.set.f={day:'day199',cefr:'no-such-level'};S.user.goal='0';S.sess.review=null;location.hash='#/';
        }""")
        page.locator('[data-go="review"]').click()
        page.locator('#show').wait_for()
        assert page.evaluate('S.sess.review.cur===outside')
        assert page.evaluate('counts(allCards(words)).n+counts(allCards(words)).b')==0
        answer(page)
        result['globalDueAndPause']='due card outside selected group remains available with empty filter and zero new-word goal'

        page.evaluate("S.user.goal='25';S.set.f={day:'day04'};S.sess.review=null;location.hash='#/cards'")
        page.locator('#nK').wait_for()
        before=page.evaluate('JSON.stringify(S.srs)')
        page.locator('#nK').click()
        page.wait_for_function('S.ev[FC.queue[0]]?.length>0')
        assert page.evaluate('JSON.stringify(S.srs)')==before
        page.locator('.xnote a').click()
        page.locator('#show').wait_for()
        page.evaluate("""()=>{
          S.revlog=Array.from({length:20000},(_,i)=>[i,'archived-id',3,'review',1]);
          window.logBefore=JSON.stringify(S.revlog);S.sess.review=null;review();
        }""")
        answer(page)
        page.locator('#undo').click()
        assert page.evaluate('JSON.stringify(S.revlog)===logBefore')
        result['practiceAndUndo']='free practice does not grade FSRS; undo restores full review log at 20,000 entries'

        boundary=page.evaluate("""()=>{
          const three=new Date(2026,9,27,3,59).getTime(),four=new Date(2026,9,27,4).getTime();
          return studyStart(four)>studyStart(three);
        }""")
        assert boundary
        page.evaluate("S.set.f={day:'day199'};location.hash='#/path'")
        page.locator('.v-home').wait_for()
        page.evaluate('async()=>{await save();await navigator.serviceWorker.ready}')
        page.reload()
        page.locator('.v-home').wait_for()
        context.set_offline(True)
        page.reload()
        page.locator('.v-home').wait_for()
        assert page.evaluate('studyDays.length===199 && deck().length===21 && studyUsage().words===27')
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        result['offline']='199 groups, chosen group and real progress survive offline reload'
        context.set_offline(False)
        page.set_viewport_size({'width':1440,'height':900})
        page.screenshot(path=str(OUT/'study-days-home-desktop.png'),full_page=True,animations='disabled')
        assert not errors,errors
        result['pageErrors']=errors
        page.locator('#settings').click()
        page.on('dialog',lambda dialog:dialog.accept())
        page.locator('#rst').click()
        assert page.evaluate('Object.keys(S.introductions).length===0 && S.studyDay===null && S.revlog.length===0 && Object.keys(S.srs).length===0')
        result['explicitReset']='reset clears schedule and word/direction history together in the isolated test profile'
        browser.close()
    server.shutdown()
    (OUT/'study-days-browser.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(result,ensure_ascii=False))


if __name__=='__main__':
    main()
