#!/usr/bin/env python3
"""Assemble the single self-contained page the artifact host wants."""

import os
import re

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

app = read('app.js')
clash = declared(engine) & declared(app)
if clash:
    raise SystemExit('both scripts declare %s at top level, which collides in one page'
                     % ', '.join(sorted(clash)))

taken = (declared(engine) | declared(app)) & RESERVED
if taken:
    raise SystemExit('%s shadows a window property and will break on load'
                     % ', '.join(sorted(taken)))

page = read('template.html')
page = page.replace('/*CSS*/', read('style.css'))
page = page.replace('/*ENGINE*/', engine)
page = page.replace('/*APP*/', app)

out = os.path.join(here, 'life.html')
with open(out, 'w', encoding='utf-8') as f:
    f.write(page)
print('%s  %d KB' % (out, len(page) // 1024))

# GitHub Pages serves a branch's /docs folder at the site root, so the same
# page is written there as index.html
# only index.html is written here; docs/CNAME, which carries the custom
# domain, is left alone
docs = os.path.join(os.path.dirname(here), 'docs')
os.makedirs(docs, exist_ok=True)
with open(os.path.join(docs, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(page)
print('%s  (for GitHub Pages)' % os.path.join(docs, 'index.html'))
