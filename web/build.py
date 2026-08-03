#!/usr/bin/env python3
"""Assemble the single self-contained page the artifact host wants."""

import os
import re
import subprocess
import time

here = os.path.dirname(os.path.abspath(__file__))


def read(name):
    with open(os.path.join(here, name), encoding='utf-8') as f:
        return f.read()


engine = read('engine.js')
# the page has no module loader, so strip the module syntax and keep the names
engine = engine.replace('export class Life', 'class Life')
engine = re.sub(r'^export \{[^}]*\};?\s*$', '', engine, flags=re.M)

def declared(src):
    return set(re.findall(r'^(?:const|let|class|function)\s+([A-Za-z_$][\w$]*)', src, re.M))


# non-configurable window properties cannot be shadowed by a top-level
# declaration in a classic script; the page dies on load if one is
RESERVED = {'top', 'self', 'parent', 'window', 'document', 'location', 'name',
            'status', 'length', 'closed', 'frames', 'history', 'origin'}

lang = read('lang.js')
app = read('app.js')
clash = (declared(engine) & declared(app)) | (declared(engine) & declared(lang)) \
        | (declared(app) & declared(lang))
if clash:
    raise SystemExit('both scripts declare %s at top level, which collides in one page'
                     % ', '.join(sorted(clash)))

taken = (declared(engine) | declared(app) | declared(lang)) & RESERVED
if taken:
    raise SystemExit('%s shadows a window property and will break on load'
                     % ', '.join(sorted(taken)))

page = read('template.html')
# A page served from a CDN and republished twenty times is a page you can
# be looking at an old copy of without knowing. Say which one this is.
try:
    stamp = subprocess.check_output(
        ['git', 'rev-parse', '--short', 'HEAD'], cwd=here,
        stderr=subprocess.DEVNULL).decode().strip()
except Exception:
    stamp = 'unbuilt'
stamp = '%s · %s' % (time.strftime('%Y-%m-%d'), stamp)

page = page.replace('/*CSS*/', read('style.css'))
page = page.replace('<!--STAMP-->', stamp)
page = page.replace('/*LANG*/', lang)
page = page.replace('/*ENGINE*/', engine)
page = page.replace('/*APP*/', app)

out = os.path.join(here, 'life.html')
with open(out, 'w', encoding='utf-8') as f:
    f.write(page)
print('%s  %d KB' % (out, len(page) // 1024))

# life.html is a fragment, because the artifact host supplies the document
# around it. Anything serving the file directly needs the whole document,
# above all the viewport meta: without it a phone lays the page out at
# 980px and shows a cropped slice of it.
cut = page.index('</style>') + len('</style>')
full = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        + page[:cut] + '\n</head>\n<body>\n' + page[cut:] + '\n</body>\n</html>\n')

# GitHub Pages serves a branch's /docs folder at the site root. Only
# index.html is written here; docs/CNAME, which carries the custom domain,
# is left alone.
docs = os.path.join(os.path.dirname(here), 'docs')
os.makedirs(docs, exist_ok=True)
with open(os.path.join(docs, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(full)
print('%s  (for GitHub Pages, a whole document)' % os.path.join(docs, 'index.html'))
