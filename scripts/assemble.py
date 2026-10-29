#!/usr/bin/env python3
"""Surenka puslapį iš partials + turinio failo (scripts/pages/<slug>.html su <!-- meta: {...} --> pirmoje eilutėje)."""
import json, re, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def part(n): return open(os.path.join(ROOT, 'partials', n), encoding='utf-8').read().rstrip('\n')
for src in sys.argv[1:]:
    txt = open(src, encoding='utf-8').read()
    m = re.match(r'\s*<!--\s*meta:\s*(\{.*?\})\s*-->\s*', txt, re.S)
    meta = json.loads(m.group(1)); body = txt[m.end():]
    out = ['<!doctype html>', '<html lang="lt">', '<head>', '  <meta charset="utf-8">', '  <meta name="viewport" content="width=device-width, initial-scale=1">',
           f'  <title>{meta["title"]} | Pelkių fondas</title>', f'  <meta name="description" content="{meta["description"]}">', part('head.html')]
    out += ['  ' + h for h in meta.get('head', [])]
    out += ['</head>', f'<body class="{meta.get("body", "")}"' + (f' data-nav="{meta["nav"]}"' if meta.get('nav') else '') + '>', part('header.html'), '  <main id="turinys">', body.rstrip('\n')]
    if meta.get('newsletter'): out.append(part('newsletter.html'))
    out += ['  </main>', part('footer.html')]
    out += ['  ' + s for s in meta.get('scripts', [])]
    out += ['</body>', '</html>', '']
    dst = os.path.join(ROOT, meta['slug'] + '.html')
    open(dst, 'w', encoding='utf-8').write('\n'.join(out)); print('->', dst)
