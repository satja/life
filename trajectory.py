import os
import textwrap
from collections import Counter

WIDTH = 76
BAR = 12
MBAR = 10

MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
          'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

DETAIL = os.environ.get('LIFE_DETAIL', 'month')

def fit(counted, room):
    chosen = []
    for name, _ in counted:
        if chosen and len(' · '.join(chosen + [name])) > room:
            break
        chosen.append(name)
    return ' · '.join(chosen)

def under(mark, text, room, indent):
    lines = textwrap.wrap(text, room) or ['']
    out = [' ' * (indent - 2) + mark + ' ' + lines[0]]
    for extra in lines[1:]:
        out.append(' ' * indent + extra)
    return out

class Chronicle:
    def __init__(self):
        self.cells = {}
        self.events = {}
        self.world_events = {}
        self.thoughts = Counter()
        self.points = Counter()
        self.wandering = 0
        self.waking = 0
        self.tone = Counter()
        self.done = Counter()
        self.total_done = 0
        self.total_thoughts = 0

    def cell(self, age, month):
        key = (age, month)
        if key not in self.cells:
            self.cells[key] = {'done': Counter(), 'n': 0,
                               'thoughts': Counter()}
        return self.cells[key]

    def did(self, age, month, name, kind):
        cell = self.cell(age, month)
        cell['done'][name] += 1
        cell['n'] += 1
        self.done[name] += 1
        self.total_done += 1

    def thought(self, age, month, text, points='always', tone=0):
        self.cell(age, month)['thoughts'][text] += 1
        self.thoughts[text] += 1
        self.points[points] += 1
        self.tone[tone] += 1
        self.total_thoughts += 1

    def event(self, age, month, text):
        self.events.setdefault((age, month), []).append(text)

    def world(self, age, month, text):
        self.world_events.setdefault((age, month), []).append(text)

    def by_month(self):
        out = []
        room = WIDTH - MBAR - 13
        peak = max(cell['n'] for cell in self.cells.values()) or 1
        preoccupation = None
        shown = None
        for key in sorted(self.cells):
            age, month = key
            cell = self.cells[key]
            filled = round(MBAR * cell['n'] / peak)
            bar = '█' * filled + '·' * (MBAR - filled)
            head = '%4d' % age if age != shown else '    '
            shown = age
            out.append('  %s ┃ %s %s  %s'
                       % (head, MONTHS[month], bar,
                          fit(cell['done'].most_common(3), room)))
            for text in self.world_events.get(key, []):
                out += under('~', text, room, 25)
            for text in self.events.get(key, []):
                out += under('└', text, room, 25)
            top = cell['thoughts'].most_common(1)
            if top and top[0][0] != preoccupation:
                preoccupation = top[0][0]
                out += under('·', 'thinking mostly about: ' + preoccupation,
                             room, 25)
        return out

    def by_year(self):
        out = []
        room = WIDTH - BAR - 7
        years, happened, outside = {}, {}, {}
        for (age, month), cell in self.cells.items():
            year = years.setdefault(age, {'done': Counter(), 'n': 0,
                                          'thoughts': Counter()})
            year['done'] += cell['done']
            year['n'] += cell['n']
            year['thoughts'] += cell['thoughts']
        for (age, month), texts in sorted(self.events.items()):
            happened.setdefault(age, []).extend(texts)
        for (age, month), texts in sorted(self.world_events.items()):
            outside.setdefault(age, []).extend(texts)
        peak = max(year['n'] for year in years.values()) or 1
        preoccupation = None
        # a year that would say exactly what last year said says what is new
        # in it instead, because two identical rows say less than one
        said, before = None, Counter()
        for age in sorted(years):
            year = years[age]
            filled = round(BAR * year['n'] / peak)
            bar = '█' * filled + '·' * (BAR - filled)
            plain = fit(year['done'].most_common(3), room)
            says = plain
            if says == said:
                fresh = [(name, n) for name, n in year['done'].most_common(14)
                         if n > 3 * before[name]]
                says = (fit(fresh[:3], room)
                        or fit(year['done'].most_common(7)[3:], room)
                        or plain)
            said, before = says, year['done']
            out.append('  %3d  %s  %s' % (age, bar, says))
            for text in outside.get(age, []):
                out += under('~', text, room, 21)
            for text in happened.get(age, []):
                out += under('└', text, room, 21)
            top = year['thoughts'].most_common(1)
            if top and top[0][0] != preoccupation:
                preoccupation = top[0][0]
                out += under('·', 'thinking mostly about: ' + preoccupation,
                             room, 21)
        return out

    def render(self, epilogue):
        out = ['', '  a life', '  ' + '═' * WIDTH, '']
        rule = '  ' + '─' * WIDTH
        for line in epilogue['opening']:
            out.append('  ' + line)
        out += ['', rule]
        if self.cells:
            if DETAIL.startswith('year'):
                out += self.by_year()
            else:
                out += self.by_month()
        out += [rule, '']
        for line in epilogue['closing']:
            out.append('  ' + line)
        out.append('')
        print('\n'.join(line.rstrip() for line in out))

chronicle = Chronicle()
