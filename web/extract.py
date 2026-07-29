#!/usr/bin/env python3
"""Pull the real Python out of the repository so the page can show it.

Nothing here is retyped. Every line the page displays is read from the
source it claims to be showing, so the two cannot drift apart.
"""

import json
import os
import re

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def source(name):
    with open(os.path.join(root, name), encoding='utf-8') as f:
        return f.read().rstrip('\n')


def block(text, anchor, name):
    """The block starting at the line beginning with `anchor`, to its dedent."""
    lines = text.split('\n')
    for i, line in enumerate(lines):
        if line.startswith(anchor):
            out = [line]
            for follow in lines[i + 1:]:
                if follow.strip() and not follow.startswith((' ', '\t', ')')):
                    break
                out.append(follow)
            while out and not out[-1].strip():
                out.pop()
            return {'file': name, 'line': i + 1, 'code': '\n'.join(out)}
    raise SystemExit('extract: no %r in %s' % (anchor, name))


def region(text, start, end, name):
    """From the line beginning with `start` up to (not including) `end`."""
    lines = text.split('\n')
    a = next(i for i, l in enumerate(lines) if l.startswith(start))
    b = next(i for i, l in enumerate(lines) if i > a and l.startswith(end))
    while b > a and not lines[b - 1].strip():
        b -= 1
    return {'file': name, 'line': a + 1, 'code': '\n'.join(lines[a:b])}


world = source('world.py')
history = source('history.py')
genes = source('genes.py')
upbringing = source('upbringing.py')
education = source('education.py')

# what each undefined-looking name in live.py actually is
REVEALS = {
    'still_sleepy': [('world.py', 'still_sleepy = '), ('world.py', 'def _still_sleepy'),
                     ('world.py', 'class Condition')],
    'must_wake_up': [('world.py', 'must_wake_up = '), ('world.py', 'def _must_wake_up')],
    'lying_down': [('world.py', 'lying_down = '), ('world.py', 'def _lying_down')],
    'morning': [('world.py', 'morning = '), ('world.py', 'def _morning')],
    'have_nothing_to_do': [('world.py', 'have_nothing_to_do = '),
                           ('world.py', 'class Condition')],
    'things_you_can_do': [('world.py', 'things_you_can_do = '), ('world.py', 'def restock'),
                          ('world.py', 'def take_place')],
    'things_you_really_must_do': [('world.py', 'things_you_really_must_do = ')],
    'things_you_should_do': [('world.py', 'things_you_should_do = '),
                             ('world.py', 'class Reproach')],
    'things_you_should_never_do': [('world.py', 'things_you_should_never_do = '),
                                   ('world.py', 'class Temptations')],
    'consciousness': [('world.py', 'consciousness = '), ('world.py', 'def refresh_mind')],
    'subconsciousness': [('world.py', 'subconsciousness = ')],
    'do': [('world.py', 'def do(')],
    'think': [('world.py', 'def think(')],
    'related': [('world.py', 'def related(')],
    'fall_asleep': [('world.py', 'def fall_asleep'), ('world.py', 'def night')],
    'get_up': [('world.py', 'def get_up')],
    'do_whatever_it_takes_to_get_up': [('world.py', 'def do_whatever_it_takes_to_get_up')],
    'get_frustrated': [('world.py', 'def get_frustrated')],
    'continue_to_be_frustrated': [('world.py', 'def continue_to_be_frustrated')],
    'dead': [('world.py', 'dead = ')],
    'upbringing': [('upbringing.py', 'def childhood'), ('upbringing.py', 'def grow_up'),
                   ('upbringing.py', 'try:')],
    'education': [('education.py', 'def understand'), ('education.py', 'def bell')],
    'world': [('world.py', 'class Condition'), ('world.py', 'class Pool'),
              ('world.py', 'class Temptations'), ('world.py', 'class Reproach')],
}

FILES = {'world.py': world, 'genes.py': genes, 'history.py': history,
         'upbringing.py': upbringing, 'education.py': education}

# a few reveals are a span rather than one block
REGIONS = {
    'genes': [('genes.py', 'class Ancestor', 'TRAITS ='),
              ('genes.py', 'def inherit', 'def mutate'),
              ('genes.py', 'lifespan =', '\0')],
    'history': [('history.py', 'class Event', 'WORLD ='),
                ('history.py', 'WORLD = [', '    Event("the currency'),
                ('history.py', 'def unfold', 'timeline =')],
}


def build():
    reveals = {}
    for name, parts in REVEALS.items():
        reveals[name] = [block(FILES[f], anchor, f) for f, anchor in parts]
    for name, parts in REGIONS.items():
        reveals[name] = [
            region(FILES[f], start, end, f) if end != '\0'
            else block(FILES[f], start, f)
            for f, start, end in parts]
    return {
        'main': source('main.py'),
        'live': source('live.py'),
        'reveals': reveals,
    }


if __name__ == '__main__':
    data = build()
    print('extracted live.py (%d lines) and %d reveals'
          % (len(data['live'].split('\n')), len(data['reveals'])))
