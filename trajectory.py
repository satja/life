import textwrap
from collections import Counter

WIDTH = 76
BAR = 12

def fit(names, room=WIDTH - BAR - 7):
    chosen = []
    for name in names:
        if chosen and len(' · '.join(chosen + [name])) > room:
            break
        chosen.append(name)
    return ' · '.join(chosen)


class Chronicle:
    def __init__(self):
        self.years = {}
        self.events = {}
        self.world_events = {}
        self.thoughts = Counter()
        self.done = Counter()
        self.total_done = 0
        self.total_thoughts = 0

    def year(self, age):
        if age not in self.years:
            self.years[age] = {'done': Counter(), 'n': 0, 'never': 0,
                               'thoughts': Counter()}
        return self.years[age]

    def did(self, age, name, kind):
        year = self.year(age)
        year['done'][name] += 1
        year['n'] += 1
        if kind == 'never':
            year['never'] += 1
        self.done[name] += 1
        self.total_done += 1

    def thought(self, age, text):
        self.year(age)['thoughts'][text] += 1
        self.thoughts[text] += 1
        self.total_thoughts += 1

    def event(self, age, text):
        self.events.setdefault(age, []).append(text)

    def world(self, age, text):
        self.world_events.setdefault(age, []).append(text)

    def under(self, mark, text):
        lines = textwrap.wrap(text, WIDTH - BAR - 7) or ['']
        out = ['       %s%s %s' % (' ' * BAR, mark, lines[0])]
        for extra in lines[1:]:
            out.append('       %s  %s' % (' ' * BAR, extra))
        return out

    def render(self, epilogue):
        out = []
        rule = '  ' + '─' * WIDTH
        out.append('')
        out.append('  a life')
        out.append('  ' + '═' * WIDTH)
        out.append('')
        for line in epilogue['opening']:
            out.append('  ' + line)
        out.append('')
        out.append(rule)
        if self.years:
            peak = max(year['n'] for year in self.years.values()) or 1
            preoccupation = None
            for age in sorted(self.years):
                year = self.years[age]
                filled = round(BAR * year['n'] / peak)
                bar = '█' * filled + '·' * (BAR - filled)
                most = fit(name for name, _ in year['done'].most_common(3))
                out.append('  %3d  %s  %s' % (age, bar, most))
                for text in self.world_events.get(age, []):
                    out += self.under('~', text)
                for text in self.events.get(age, []):
                    out += self.under('└', text)
                top = year['thoughts'].most_common(1)
                if top and top[0][0] != preoccupation:
                    preoccupation = top[0][0]
                    out += self.under('·', 'thinking mostly about: ' + preoccupation)
        out.append(rule)
        out.append('')
        for line in epilogue['closing']:
            out.append('  ' + line)
        out.append('')
        print('\n'.join(line.rstrip() for line in out))

chronicle = Chronicle()
