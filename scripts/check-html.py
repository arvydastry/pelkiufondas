#!/usr/bin/env python3
"""Maketo puslapių tikrinimas: fragmentų vientisumas, nuorodos, paveikslėliai, video, antraštės.
Naudojimas: python3 scripts/check-html.py [failas.html ...]  (be argumentų – visi *.html projekte)"""
import sys, re, os, glob, html.parser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLANNED = {"index.html","pelkes.html","terminu-zodynas.html","galerija.html","apie-mus.html","veiklos-ataskaitos.html","veikla.html","co2.html","projektai.html","projektas.html","paslaugos.html","publikacijos.html","videoteka.html","naujienos.html","naujiena.html","kontaktai.html","prisidek.html"}
VOID = {"area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"}

def partial(name):
    return open(os.path.join(ROOT, "partials", name), encoding="utf-8").read().strip()

class P(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(); self.stack=[]; self.errors=[]; self.imgs=[]; self.videos=[]; self.links=[]; self.hs=[]; self.ids={}; self.line_of_h1=0; self.h1=0; self.autoplay_videos=0
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag not in VOID: self.stack.append((tag,self.getpos()[0]))
        if tag=="img": self.imgs.append((a.get("src",""),a.get("alt"),self.getpos()[0]))
        if tag=="video": self.videos.append((a.get("data-src") or a.get("src"),self.getpos()[0]))
        if tag=="a": self.links.append((a.get("href"),self.getpos()[0]))
        if tag in ("h1","h2","h3","h4"):
            self.hs.append((tag,self.getpos()[0]))
            if tag=="h1": self.h1+=1
        if "id" in a:
            self.ids.setdefault(a["id"],[]).append(self.getpos()[0])
    def handle_endtag(self, tag):
        if tag in VOID: return
        if not self.stack: self.errors.append(f"eilutė {self.getpos()[0]}: uždaroma </{tag}> be atidarymo"); return
        if self.stack[-1][0]!=tag:
            # bandome rasti aukščiau
            for i in range(len(self.stack)-1,-1,-1):
                if self.stack[i][0]==tag:
                    for t,l in self.stack[i+1:]: self.errors.append(f"eilutė {l}: neuždaryta <{t}> (uždaryta </{tag}> eilutėje {self.getpos()[0]})")
                    del self.stack[i:]; return
            self.errors.append(f"eilutė {self.getpos()[0]}: </{tag}> neatitinka <{self.stack[-1][0]}> (eilutė {self.stack[-1][1]})")
        else: self.stack.pop()

def check(path):
    rel=os.path.relpath(path,ROOT); src=open(path,encoding="utf-8").read(); probs=[]; warns=[]
    p=P(); p.feed(src)
    probs+=p.errors
    for t,l in p.stack:
        if t not in ("html","body"): probs.append(f"eilutė {l}: neuždaryta <{t}> iki failo pabaigos")
    for name in ("header.html","footer.html"):
        if partial(name) not in src: probs.append(f"partials/{name} neįklijuotas pažodžiui (arba pakeistas)")
    if 'assets/css/style.css' not in src: probs.append("nėra assets/css/style.css")
    if 'assets/js/main.js' not in src: probs.append("nėra assets/js/main.js")
    if "classList.add('js')" not in src: probs.append("nėra <script>document.documentElement.classList.add('js')</script> (animacijos nesuveiks)")
    if '<html lang="lt">' not in src: probs.append('nėra <html lang="lt">')
    if p.h1!=1: probs.append(f"h1 kiekis: {p.h1} (turi būti 1)")
    if not re.search(r'<main[^>]*id="turinys"',src): probs.append('nėra <main id="turinys">')
    for i,(s,alt,l) in enumerate(p.imgs):
        if alt is None: probs.append(f"eilutė {l}: <img> be alt (src={s[:60]})")
        if s.startswith("assets/") and not os.path.exists(os.path.join(ROOT,s.split("?")[0])): probs.append(f"eilutė {l}: nėra failo {s}")
    for s,l in p.videos:
        if not s: probs.append(f"eilutė {l}: <video> be data-src/src")
    auto=sum(1 for s,l in p.videos)
    if auto>8: warns.append(f"{auto} <video> elementų – per daug autoplay video vienam puslapiui (≤8)")
    seen=set()
    for h,l in p.links:
        if h is None: probs.append(f"eilutė {l}: <a> be href"); continue
        if h.startswith(("http","mailto:","tel:","#")): 
            if h.startswith("#") and len(h)>1 and h[1:] not in p.ids: probs.append(f"eilutė {l}: inkaras {h} neegzistuoja šiame puslapyje")
            continue
        f=h.split("#")[0].split("?")[0]
        if not f: continue
        if f.endswith(".html"):
            if f not in PLANNED: probs.append(f"eilutė {l}: nuoroda į neplanuotą puslapį {f}")
            elif not os.path.exists(os.path.join(ROOT,f)) and f not in seen: warns.append(f"nuoroda į {f}, kuris dar nesukurtas"); seen.add(f)
            if "#" in h:
                anchor=h.split("#")[1]; target=os.path.join(ROOT,f)
                if os.path.exists(target) and f'id="{anchor}"' not in open(target,encoding="utf-8").read(): warns.append(f"eilutė {l}: inkaro #{anchor} nėra faile {f}")
        elif f.startswith("assets/") and not os.path.exists(os.path.join(ROOT,f)): probs.append(f"eilutė {l}: nėra failo {f}")
    for k,v in p.ids.items():
        if len(v)>1: probs.append(f"id=\"{k}\" kartojasi eilutėse {v}")
    # lietuviškos raidės – įtartini ASCII pakaitalai
    text_only=re.sub(r'<[^>]+>',' ',re.sub(r'<(script|style)[^>]*>.*?</\1>','',src,flags=re.S))
    for m in re.finditer(r'\b(Pelkiu|pelkiu|zodynas|Zodynas|Prisidek|Naujienlaiskis|atkurimas|Siusti|ivairove)\b',text_only):
        warns.append(f"galbūt trūksta diakritikų tekste: „{m.group(0)}“ ({text_only[max(0,m.start()-30):m.end()+30].strip()!r})")
    tagcount=len(re.findall(r'<span class="new-fn__badge[^"]*"',src))-1   # minus maketo juostos legenda
    print(f"== {rel}: {len(probs)} klaidos, {len(warns)} įspėjimai, {len(p.hs)} antraštės, {len(p.imgs)} img, {len(p.videos)} video, {tagcount} „Nauja“ žymekliai")
    for x in probs: print("  KLAIDA:",x)
    for x in warns: print("  įspėjimas:",x)
    return len(probs)

files=sys.argv[1:] or sorted(glob.glob(os.path.join(ROOT,"*.html")))
total=sum(check(f) for f in files if sys.argv[1:] or not os.path.basename(f).startswith("_"))
sys.exit(1 if total else 0)
