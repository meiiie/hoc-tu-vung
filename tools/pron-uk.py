import json,re,csv
M={'ɑː':['ɑ'],'ɒ':['ɑ'],'ɔː':['ɔ'],'əʊ':['oʊ'],'iː':['i'],'uː':['u'],'ɜː':['ɚ'],'ɐ':['ʌ'],'ɪə':['ɪ','ə'],'ɛə':['ɛ','ə'],'ʊə':['ʊ','ə'],'dʒ':['d͡ʒ'],'tʃ':['t͡ʃ'],'g':['ɡ'],'r':['ɹ']}
VOW={'ɑ','æ','ʌ','ə','ɔ','aʊ','aɪ','ɛ','ɚ','eɪ','ɪ','i','oʊ','ɔɪ','ʊ','u'}
bf={}
for l in open('britfone.csv',encoding='utf-8'):
  w,_,p=l.strip().partition(',');w=re.sub(r'\(\d+\)$','',w.strip()).lower();bf.setdefault(w,[]).append(p.split())
def conv(ph):
  out=[]
  for x in ph:
    st=1 if x.startswith('ˈ') else 2 if x.startswith('ˌ') else 0;x=x.lstrip('ˈˌ')
    ps=M.get(x,[x])
    for i,q in enumerate(ps):out.append([q,(st if i==0 else 0) if q in VOW else None])
  return out
D=json.load(open('/workspace/english/hoc-tu-vung/data/p1.json'));out={};miss=[]
for w in D:
  t=re.sub(r'\s*\(.*?\)','',w['w']).split(',')[0].strip().lower()
  parts=[x for x in re.split(r"[ \-]+",t) if x]
  if not all(x in bf for x in parts):miss.append(t);continue
  vs=[[]]
  for x in parts:vs=[v+conv(p) for v in vs for p in bf[x][:2]]
  res=[];seen=set()
  for v in vs:
    k=' '.join(p for p,_ in v)
    if k not in seen:seen.add(k);res.append(v)
  out[w['id']]=res[:3]
json.dump(out,open('/workspace/english/hoc-tu-vung/data/pron-uk.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(out),'missing',len(miss),miss[:30]);print(out['p1-234'],out['p1-015'])
allp=set(p for v in out.values() for var in v for p,_ in var);print(sorted(allp))
