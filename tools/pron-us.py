import json,re
A={'AA':'ɑ','AE':'æ','AH':'ʌ','AO':'ɔ','AW':'aʊ','AY':'aɪ','B':'b','CH':'t͡ʃ','D':'d','DH':'ð','EH':'ɛ','ER':'ɚ','EY':'eɪ','F':'f','G':'ɡ','HH':'h','IH':'ɪ','IY':'i','JH':'d͡ʒ','K':'k','L':'l','M':'m','N':'n','NG':'ŋ','OW':'oʊ','OY':'ɔɪ','P':'p','R':'ɹ','S':'s','SH':'ʃ','T':'t','TH':'θ','UH':'ʊ','UW':'u','V':'v','W':'w','Y':'j','Z':'z','ZH':'ʒ'}
def ipa(a):
  b=re.sub(r'\d','',a);s=a[-1] if a[-1].isdigit() else ''
  return ('ə' if b=='AH' and s=='0' else A[b]),(int(s) if s else None)
cmu={}
for l in open('/tmp/m/cmudict.dict'):
  l=l.split('#')[0].strip()
  if l:w,*p=l.split();cmu.setdefault(re.sub(r'\(\d+\)$','',w),[]).append(p)
D=json.load(open('/workspace/english/hoc-tu-vung/data/p1.json'));out={}
for w in D:
  t=re.sub(r'\s*\(.*?\)','',w['w']).split(',')[0].strip().lower().replace('analyse','analyze')
  parts=[x for x in re.split(r"[ \-]+",t) if x]
  # variants: cartesian of first 2 variants per part, max 3
  vs=[[]]
  for x in parts:vs=[v+[('|',None)]*(len(v)>0)+[ipa(a) for a in p] for v in vs for p in cmu[x][:2]]
  seen=[];res=[]
  for v in vs:
    k=' '.join(p for p,_ in v)
    if k in seen:continue
    seen.append(k);res.append([[p,s] for p,s in v if p!='|'])
  out[w['id']]=res[:3]
json.dump(out,open('/workspace/english/hoc-tu-vung/data/pron.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(out),out['p1-015'])
