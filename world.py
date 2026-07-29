import atexit
import math
import random
import textwrap

import fate
import genes
import upbringing
import education
import history
from trajectory import chronicle

__all__ = [
    'still_sleepy', 'must_wake_up', 'do_whatever_it_takes_to_get_up', 'get_up',
    'lying_down', 'fall_asleep', 'get_frustrated',
    'continue_to_be_frustrated', 'morning', 'have_nothing_to_do',
    'subconsciousness', 'consciousness', 'related', 'think', 'do',
    'things_you_can_do', 'things_you_really_must_do', 'things_you_should_do',
    'things_you_should_never_do', 'dead',
]

MINUTES_PER_DAY = 24 * 60
DAYS_PER_YEAR = 365

STAGES = [(76, 'late'), (65, 'old'), (50, 'later'), (35, 'middle'),
          (20, 'young'), (13, 'teenager'), (3, 'child'), (0, 'infant')]

CAN_DO = {
    'infant': [("sleeping", 120), ("being carried", 40), ("crying", 20),
               ("staring at the lamp", 30), ("eating", 35),
               ("putting it in your mouth", 25), ("laughing at nothing", 20),
               ("being put down again", 30)],
    'child': [("running", 60), ("asking why", 30), ("drawing a house", 45),
              ("breaking something", 20), ("watching cartoons", 90),
              ("riding a bike", 75), ("collecting stones", 50),
              ("lying about homework", 15), ("playing until it is dark", 150),
              ("being bored", 80)],
    'teenager': [("staying up too late", 180), ("arguing", 40),
                 ("listening to the same song", 60), ("being embarrassed", 30),
                 ("studying the night before", 200), ("slamming a door", 5),
                 ("looking in the mirror", 25),
                 ("loving someone who does not know", 90),
                 ("saying nothing at dinner", 45)],
    'young': [("working", 430), ("moving out", 120), ("falling in love", 90),
              ("going somewhere cheap", 240), ("drinking too much", 200),
              ("starting something", 120), ("quitting something", 30),
              ("applying", 60), ("waiting for an answer", 45),
              ("calling home, briefly", 12)],
    'middle': [("working", 450), ("fixing the same thing again", 70),
               ("worrying about money", 40), ("driving somewhere", 65),
               ("answering messages", 55), ("carrying something heavy", 30),
               ("cancelling", 10), ("being needed", 120),
               ("seeing fewer friends", 90), ("sleeping badly", 60)],
    'later': [("working, still", 430), ("looking after someone", 130),
              ("going to funerals", 180), ("fixing the same thing again", 70),
              ("walking for the sake of it", 55),
              ("reading the news too closely", 60),
              ("having the same argument", 35), ("sleeping badly", 60),
              ("putting something aside", 20),
              ("standing in the doorway of a room", 15)],
    'late': [("sitting", 130), ("being visited", 90), ("waiting", 150),
             ("sleeping in the afternoon", 95), ("telling the story again", 35),
             ("not recognising the street", 40),
             ("looking at photographs", 45), ("going to the doctor", 110)],
    'old': [("walking slowly", 60), ("reading the same page twice", 50),
            ("watering the plants", 25), ("watching the news", 90),
            ("waiting for the phone", 120), ("telling the story again", 35),
            ("sitting in the sun", 80), ("going to the doctor", 110)],
}

MUST_DO = {
    'infant': ["being fed"],
    'child': ["going to school", "doing the homework"],
    'teenager': ["going to school", "handing it in", "explaining yourself"],
    'young': ["going to work", "paying the bill", "answering the message",
              "renewing the documents"],
    'middle': ["going to work", "paying the bill", "taking the bins out",
               "answering the message", "getting it repaired"],
    'later': ["going to work", "paying the bill", "taking the pills",
              "answering the message", "getting it repaired"],
    'old': ["taking the pills", "going to the check-up", "paying the bill"],
    'late': ["taking the pills", "going to the check-up"],
}

NEVER_DO = [
    "checking the phone at three in the morning",
    "saying it out loud",
    "comparing",
    "keeping score",
    "reading the comments",
    "replying immediately",
    "looking back too long",
    "having one more",
    "bringing it up again",
]

SHOULD_DO = [
    "call your mother",
    "sleep more",
    "get it looked at",
    "learn the other language properly",
    "write it down",
    "forgive him",
    "throw out the boxes",
    "say it while there is time",
    "go outside",
    "read the book you bought",
    "fix the tap",
    "apologise properly",
    "find out what happened to Marko",
    "stand up straight",
]

THOUGHTS = {
    'infant': [("the ceiling", 'home'), ("that face again", 'love'),
               ("hunger", 'body'), ("warm", 'body'),
               ("the sound of the door", 'home'), ("being put down", 'home')],
    'child': [("what is under the bed", 'fear'), ("why the sky", 'time'),
              ("Saturday", 'time'), ("the smell of the hallway", 'home'),
              ("whether they saw", 'shame'), ("what they said about you", 'shame'),
              ("being allowed to stay out", 'time')],
    'teenager': [("what you said in the corridor", 'shame'),
                 ("whether they meant it", 'love'), ("the same song", 'love'),
                 ("getting out of here", 'time'), ("your own face", 'body'),
                 ("nothing, loudly", 'time')],
    'young': [("the rent", 'money'), ("they said 'sure', not 'yes'", 'love'),
              ("whether this is the job", 'work'), ("it is August already", 'time'),
              ("what you said in 2009", 'shame'), ("calling home", 'home'),
              ("the noise the knee makes", 'body')],
    'middle': [("the bill due on the eleventh", 'money'),
               ("that meeting could have been an email", 'work'),
               ("the noise the knee makes", 'body'),
               ("everyone in this photograph is older now", 'death'),
               ("it is August already", 'time'),
               ("what you said in 2009", 'shame'),
               ("whether they are all right", 'love'),
               ("the smell of the hallway", 'home')],
    'later': [("who is left", 'death'), ("the noise the knee makes", 'body'),
              ("the bill due on the eleventh", 'money'),
              ("whether they are all right", 'love'),
              ("what it used to cost", 'money'),
              ("it is August already", 'time'),
              ("what you said in 2009", 'shame')],
    'late': [("who is left", 'death'), ("the smell of the hallway", 'home'),
             ("whether they will call", 'love'), ("the stairs", 'body'),
             ("being the last one collected", 'shame')],
    'old': [("everyone in this photograph is older now", 'death'),
            ("the smell of the hallway", 'home'),
            ("whether they will call", 'love'),
            ("the stairs", 'body'), ("Saturday", 'time'),
            ("what you said in 2009", 'shame')],
}

DEEP = [
    ("the stairs in the dark", 'fear', 0),
    ("being the last one collected", 'shame', 0),
    ("water, further out than you thought", 'fear', 0),
    ("a door you cannot find in a house you know", 'home', 16),
    ("your own name, said wrong", 'shame', 16),
    ("the light in a hospital corridor", 'death', 27),
]

SEASON = {
    'winter': [("keeping warm", 90), ("waiting for it to get light", 40),
               ("staying in", 120)],
    'spring': [("opening the windows", 25), ("being outside again", 80)],
    'summer': [("sitting in the shade", 90), ("going to the water", 240),
               ("lying awake in the heat", 60)],
    'autumn': [("going back to it", 60),
               ("watching it get dark early", 40)],
}

SEASONS = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer',
           'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter']

MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
          'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

HOLIDAY = [("being at the sea", 320), ("doing nothing, on purpose", 190),
           ("reading half a book", 110), ("eating outside", 95)]

WORK = {"working", "working, still", "answering messages", "how to look busy",
        "looking for work", "driving somewhere", "going back to it"}

SCHOOL = {"going to school", "doing the homework", "handing it in"}

TERM_ONLY = {"lying about homework", "studying the night before"}

# what a regret is actually about, so that the subconscious is not all shame
REGRET = {
    "checking the phone at three in the morning": 'time',
    "saying it out loud": 'shame',
    "comparing": 'shame',
    "keeping score": 'love',
    "reading the comments": 'shame',
    "replying immediately": 'work',
    "looking back too long": 'time',
    "having one more": 'body',
    "bringing it up again": 'love',
}

# Every dial the machinery turns on, and what leans on it. A trait is not a
# label: it is an entry in this table, and the entry is read by the loop.
DIALS = {
    'sleep':        0.05,        # fall_asleep(): the chance, before attempts
    'restless':     1.0,         # how much idle thinking a thing leaves behind
    'conscience':   1 / 26000.0, # the chance the list comes into view
    'temptation':   1 / 12.0,    # the chance the never-do list has a length
    'persistence':  0.96,        # how slowly what you do drifts back
    'frailty':      1.0,         # how hard the world lands on you
}

# what you were given, and what it does. ('+', n) shifts, ('x', n) scales.
FROM_GENES = {
    'worry':            {'sleep': ('+', -0.018), 'restless': ('x', 1.35),
                         'temptation': ('x', 1.20)},
    'fear_of_the_dark': {'sleep': ('+', -0.010), 'restless': ('x', 1.15)},
    'patience':         {'sleep': ('+', 0.012), 'restless': ('x', 0.80),
                         'temptation': ('x', 0.75)},
    'stubbornness':     {'persistence': ('+', 0.02), 'frailty': ('x', 0.90),
                         'conscience': ('x', 0.80)},
    'hope':             {'conscience': ('x', 1.60), 'frailty': ('x', 0.85)},
    'silence':          {'temptation': ('x', 0.80), 'restless': ('x', 1.10)},
    'posture':          {'frailty': ('x', 1.15)},
    'a way with people': {'conscience': ('x', 1.25)},
}

# what was done to you before you could object
FROM_UPBRINGING = {'temptation': ('x', 1.15), 'restless': ('x', 1.10)}

# and what the century does while it is going on
FROM_HISTORY = {
    'war':      {'sleep': ('+', -0.015), 'restless': ('x', 1.30),
                 'temptation': ('x', 1.20)},
    'plague':   {'restless': ('x', 1.20), 'conscience': ('x', 1.40)},
    'money':    {'restless': ('x', 1.20), 'temptation': ('x', 1.15)},
    'nature':   {'sleep': ('+', -0.010), 'restless': ('x', 1.15)},
    'politics': {'restless': ('x', 1.10)},
    'progress': {'conscience': ('x', 1.10)},
}


def wind_up():
    """Recompute every dial from what you were given, what was done to you,
    and what is going on at the moment. Kept as a working, so that the
    working can be read."""
    working = {name: [] for name in DIALS}
    state.dials = dict(DIALS)

    def lean(source, table):
        for dial, (how, amount) in table.items():
            working[dial].append((source, how, amount))
            if how == '+':
                state.dials[dial] += amount
            else:
                state.dials[dial] *= amount

    for trait in sorted(genes.given):
        if trait in FROM_GENES:
            lean('%s (%s)' % (trait, genes.from_whom.get(trait, '?')),
                 FROM_GENES[trait])
    for _ in upbringing.unresolved:
        lean('carried from childhood', FROM_UPBRINGING)
    for circumstance in state.circumstances:
        kind = circumstance.get('kind')
        if kind in FROM_HISTORY:
            lean(circumstance['text'], FROM_HISTORY[kind])

    state.dials['sleep'] = max(0.008, state.dials['sleep'])
    state.dials['persistence'] = min(0.995, state.dials['persistence'])
    state.working = working


RECOVERS = 1 / 26000.0


def energy_at(age):
    if age < 3:
        return 4
    if age < 13:
        return 6 + age // 5
    if age < 20:
        return 9
    if age < 36:
        return 10
    if age < 56:
        return 9
    if age < 66:
        return 8
    if age < 76:
        return 6
    if age < 86:
        return 4
    return 3


class Clock:
    def __init__(self):
        self.minute = 6 * 60 + 14

    def tick(self, minutes=1):
        self.minute += minutes

    @property
    def day(self):
        return self.minute // MINUTES_PER_DAY

    @property
    def hour(self):
        return (self.minute % MINUTES_PER_DAY) // 60

    @property
    def age(self):
        return self.day // DAYS_PER_YEAR

    @property
    def month(self):
        return min(11, (self.day % DAYS_PER_YEAR) * 12 // DAYS_PER_YEAR)

    def time(self):
        rest = self.minute % MINUTES_PER_DAY
        return '%02d:%02d' % (rest // 60, rest % 60)


class Condition:
    def __init__(self, test, cost=1):
        self.test = test
        self.cost = cost

    def __bool__(self):
        clock.tick(self.cost)
        return bool(self.test())


class Pool(list):
    pass


class Temptations(Pool):
    def __len__(self):
        return Pool.__len__(self) if state.tempted else 0


class Reproach(Pool):
    def __len__(self):
        return Pool.__len__(self) if state.reminded else 0


class Doing:
    __slots__ = ('name', 'kind', 'minutes')

    def __init__(self, name, kind, minutes):
        self.name = name
        self.kind = kind
        self.minutes = minutes


class Thought:
    __slots__ = ('text', 'theme')

    def __init__(self, text, theme):
        self.text = text
        self.theme = theme


class State:
    def __init__(self):
        self.alive = True
        self.grogginess = 0
        self.evening_left = 60
        self.idle = 0
        self.lying = False
        self.tempted = False
        self.reminded = False
        self.sleep_attempts = 0
        self.insomnia_noted = False
        self.insomnia_nights = 0
        self.worst_night = (0, 0, '')
        self.day_index = 0
        self.stage = None
        self.mornings = 0
        self.alarms = 0
        self.frustrated = 0
        self.got_round_to = 0
        self.scars = []
        self.circumstances = []
        self.choices = []
        self.world_events = []
        self.no_longer_possible = set()
        self.year_seen = -1
        self.month_seen = -1
        self.skills_kept = []
        self.holiday_from = -1
        self.holiday_to = -1
        self.cause = None
        self.pending = []
        self.preoccupation = None
        self.dials = dict(DIALS)
        self.working = {}
        self.died_at = None


clock = Clock()
state = State()

things_you_can_do = Pool()
things_you_really_must_do = Pool()
things_you_should_do = Reproach()
things_you_should_never_do = Temptations()
consciousness = Pool()
subconsciousness = Pool()
by_theme = {}


def stage_at(age):
    for start, name in STAGES:
        if age >= start:
            return name
    return 'infant'


BASE = {
    "moving out": 0.18, "falling in love": 0.25, "quitting something": 0.3,
    "starting something": 0.45, "going somewhere cheap": 0.4,
    "going to funerals": 0.35, "breaking something": 0.6,
    "slamming a door": 0.7, "not recognising the street": 0.4,
    "looking for work": 0.6, "going to look at it": 0.25,
    "boarding up the windows": 0.5, "sleeping in the car": 0.5,
    "carrying things upstairs": 0.5, "drying it out": 0.4,
    "leaving for a while": 0.25, "going to the doctor": 0.7,
    "working": 2.0, "working, still": 2.0, "sleeping": 1.6, "eating": 1.6,
    "watching the news": 1.3, "sitting": 1.5, "waiting": 1.3,
    "queueing": 1.2, "staying indoors": 1.4,
}

salience = {}


def drift():
    for name, _ in state.choices:
        salience.setdefault(name, BASE.get(name, 1.0))
    for name in salience:
        anchor = math.log(BASE.get(name, 1.0))
        here = math.log(salience[name])
        moved = anchor + state.dials['persistence'] * (here - anchor) \
            + random.gauss(0, 0.14)
        salience[name] = min(4.0, max(0.15, math.exp(moved)))


def weighted_pick(choices, wanted):
    scored = []
    for index, (name, minutes) in enumerate(choices):
        weight = salience.get(name, 1.0)
        scored.append((random.random() ** (1.0 / weight), index, name, minutes))
    scored.sort(reverse=True)
    return [(name, minutes) for _, _, name, minutes in scored[:wanted]]


def refresh_mind():
    name = stage_at(clock.age)
    thoughts = list(THOUGHTS[name])
    for circumstance in state.circumstances:
        thoughts += circumstance['thinks']
    age = clock.age
    if not state.preoccupation or state.preoccupation[1] <= age:
        state.preoccupation = (random.choice(thoughts),
                               age + random.randrange(2, 8))
    thoughts += [state.preoccupation[0]] * 3
    consciousness[:] = [Thought(t, m) for t, m in thoughts]
    subconsciousness[:] = [Thought(t, m) for t, m, since in DEEP
                           if age >= since] + list(state.scars)
    things_you_should_never_do[:] = [
        Doing(n, 'never', random.randrange(5, 40))
        for n in (NEVER_DO if age >= 13 else [])]
    by_theme.clear()
    for thought in consciousness + subconsciousness:
        by_theme.setdefault(thought.theme, []).append(thought)


def related(thought):
    return by_theme.get(thought.theme) or list(consciousness)


def think(thought):
    clock.tick(random.randrange(1, 4))
    state.idle -= 1
    chronicle.thought(clock.age, clock.month, thought.text)


def do(thing):
    clock.tick(thing.minutes)
    chronicle.did(clock.age, clock.month, thing.name, thing.kind)
    if thing.kind == 'never':
        if random.randrange(9) == 0:
            scar(thing.name)
    else:
        if thing.kind == 'should':
            state.reminded = False
            state.got_round_to += 1
        for pool in (things_you_can_do, things_you_really_must_do,
                     things_you_should_do):
            if thing in pool:
                pool.remove(thing)
                break
    state.idle += round(random.randrange(0, 3) * state.dials['restless'])
    state.tempted = random.random() < state.dials['temptation']
    if not state.reminded:
        state.reminded = random.random() < state.dials['conscience']


def remember(text, theme):
    if len(state.scars) >= 8:
        return
    if any(old.text == text for old in state.scars):
        return
    thought = Thought(text, theme)
    state.scars.append(thought)
    subconsciousness.append(thought)
    by_theme.setdefault(theme, []).append(thought)


def scar(name):
    remember(name + ", again", REGRET.get(name, 'shame'))


def _still_sleepy():
    if state.grogginess <= 0:
        return False
    state.grogginess -= 1
    return True


def _must_wake_up():
    age = clock.age
    if age < 6 or age >= 66 or not state.alive:
        return False
    return clock.day % 7 not in (5, 6)


def _lying_down():
    if state.lying:
        return True
    state.evening_left -= 1
    if state.evening_left <= 0:
        state.lying = True
        state.idle += round(random.randrange(2, 9) * state.dials['restless'])
        return True
    return False


def _morning():
    if 3 <= clock.hour < 7:
        if not state.insomnia_noted:
            state.insomnia_noted = True
            state.insomnia_nights += 1
        return True
    return False


still_sleepy = Condition(_still_sleepy)
must_wake_up = Condition(_must_wake_up)
lying_down = Condition(_lying_down)
morning = Condition(_morning)
have_nothing_to_do = Condition(lambda: state.idle > 0, cost=0)
dead = Condition(lambda: not state.alive, cost=0)


def get_frustrated():
    clock.tick(random.randrange(2, 10))
    state.frustrated += 1


def continue_to_be_frustrated():
    clock.tick(1)


def fall_asleep():
    if not state.alive:
        night()
        return True
    clock.tick(random.randrange(1, 5))
    state.sleep_attempts += 1
    state.idle += random.randrange(0, 2)
    chance = state.dials['sleep'] + 0.012 * state.sleep_attempts
    if random.random() < chance:
        night()
        return True
    return False


def night():
    if state.insomnia_noted and state.sleep_attempts > state.worst_night[0]:
        state.worst_night = (state.sleep_attempts, clock.age, clock.time())
    wake = 6 * 60 + random.randrange(0, 150)
    target = (state.day_index + 1) * MINUTES_PER_DAY + wake
    clock.minute = max(target, clock.minute + 45)
    state.grogginess = random.randrange(0, 45)
    state.lying = False


def get_up():
    state.grogginess = 0
    morning_of(full=True)


def do_whatever_it_takes_to_get_up():
    clock.tick(random.randrange(5, 25))
    state.grogginess = 0
    state.alarms += 1
    morning_of(full=False)


def morning_of(full):
    state.mornings += 1
    state.day_index = clock.day
    state.sleep_attempts = 0
    state.insomnia_noted = False
    state.lying = False
    state.evening_left = random.randrange(30, 150)

    age = clock.age
    if age != state.year_seen:
        state.year_seen = age
        birthday(age)
    if not state.alive:
        things_you_can_do[:] = []
        return
    if clock.month != state.month_seen:
        new_month()

    energy = energy_at(age) - (0 if full else 1)
    doy = clock.day % DAYS_PER_YEAR
    away = state.holiday_from <= doy < state.holiday_to
    pool = state.choices
    if away:
        pool = [c for c in pool
                if c[0] not in WORK and c[0] not in TERM_ONLY] + HOLIDAY
    elif age < 20 and 172 <= doy < 244:
        pool = [c for c in pool if c[0] not in TERM_ONLY]
    things_you_can_do[:] = [
        Doing(n, 'can', m) for n, m in weighted_pick(pool, max(1, energy))]

    if not away and len(things_you_really_must_do) < 9 and random.randrange(2) == 0:
        owed = MUST_DO[state.stage]
        if 172 <= doy < 244:
            owed = [o for o in owed if o not in SCHOOL]
        if owed:
            things_you_really_must_do.append(
                Doing(random.choice(owed), 'must', random.randrange(20, 90)))
    state.tempted = random.random() < state.dials['temptation']
    state.reminded = False


def frailty(age):
    if age < 5:
        return 1.6
    if age < 15:
        return 0.5
    if age < 45:
        return 0.8
    if age < 65:
        return 1.4
    if age < 80:
        return 2.5
    return 4.0


def die(age, cause):
    state.alive = False
    state.died_at = (age, clock.time())
    state.cause = cause
    state.pending = []
    chronicle.cell(age, clock.month)
    chronicle.event(age, clock.month, 'does not get up')
    things_you_can_do[:] = []


def take_place(event):
    age = clock.age
    state.circumstances.append(
        {'text': event.text, 'until': age + event.years, 'risk': event.risk,
         'kind': event.kind, 'does': event.does, 'thinks': event.thinks})
    month = random.randrange(12)
    state.world_events.append((age, month, event.text))
    chronicle.world(age, month, event.text)
    if event.costs:
        owe(event.costs)


def owe(name):
    if name in state.no_longer_possible:
        return
    if name in [d.name for d in things_you_should_do]:
        return
    things_you_should_do.append(
        Doing(name, 'should', random.randrange(20, 120)))


def take_effect(key):
    age = clock.age
    if key == 'parent':
        state.circumstances.append(
            {'text': 'a child', 'until': age + 18, 'risk': 0.0,
             'kind': 'child',
             'does': [("carrying someone who is asleep", 60),
                      ("reading the same book aloud", 30),
                      ("worrying about someone else", 45)],
             'thinks': [("whether they are all right", 'love')]})
    elif key == 'father':
        remember("the silence at the table", 'death')
    elif key == 'mother':
        remember("the hallway, empty", 'death')
        state.no_longer_possible.add("call your mother")
        for item in list(things_you_should_do):
            if item.name == "call your mother":
                things_you_should_do.remove(item)


def birthday(age):
    state.circumstances = [c for c in state.circumstances if c['until'] > age]
    for event in history.starting(age):
        take_place(event)
    wind_up()
    if age > genes.lifespan:
        die(age, None)
        return
    for circumstance in state.circumstances:
        chance = circumstance['risk'] * frailty(age) * state.dials['frailty']
        if chance and random.random() < chance:
            die(age, circumstance['text'])
            return
    state.pending = [(random.randrange(12), text, effect)
                     for text, effect in schedule.pop(age, [])]
    offer_something_you_should_do(age)
    state.stage = stage_at(age)
    keeping = (52 - age) / 32.0
    state.skills_kept = [s for s in education.skills
                         if 20 <= age < 52 and random.random() < keeping]
    state.month_seen = -1
    if 5 <= age < 66:
        state.holiday_from = random.randrange(176, 232)
        state.holiday_to = state.holiday_from + random.randrange(12, 25)
    else:
        state.holiday_from = state.holiday_to = -1
    refresh_mind()


def restock():
    choices = list(CAN_DO[state.stage])
    choices += [(s, 45) for s in state.skills_kept]
    for circumstance in state.circumstances:
        choices += circumstance['does']
    choices += SEASON[SEASONS[clock.month]]
    already = set()
    distinct = []
    for name, minutes in choices:
        if name not in already:
            already.add(name)
            distinct.append((name, minutes))
    state.choices = distinct


def new_month():
    state.month_seen = clock.month
    fire_pending()
    restock()
    drift()


seen = set()


def once(age, text):
    if text not in seen:
        seen.add(text)
        chronicle.event(age, clock.month, text)


def fire_pending():
    still_to_come = []
    for month, text, effect in state.pending:
        if month != clock.month:
            still_to_come.append((month, text, effect))
            continue
        once(clock.age, text)
        if effect:
            take_effect(effect)
    state.pending = still_to_come


def offer_something_you_should_do(age):
    if age < 5 or random.randrange(4) > 0:
        return
    if list.__len__(things_you_should_do) >= 9:
        return
    on_the_list = [d.name for d in things_you_should_do]
    remaining = [s for s in SHOULD_DO
                 if s not in on_the_list and s not in state.no_longer_possible]
    if remaining:
        things_you_should_do.append(
            Doing(random.choice(remaining), 'should', random.randrange(20, 120)))


def build_schedule():
    plan = {}

    def add(age, text, effect=None):
        plan.setdefault(age, []).append((text, effect))

    add(1, 'says a word, on purpose')
    add(6, 'starts school')
    add(18, 'leaves school with ' + education.diploma)
    add(18, 'average mark: %.1f' % education.average)
    add(random.randrange(15, 20), 'falls in love, silently')
    add(random.randrange(19, 26), 'first job')
    add(random.randrange(20, 29), 'moves out for good')
    if random.randrange(3) > 0:
        add(random.randrange(26, 39),
            'becomes a parent, and promises not to', 'parent')
    if random.randrange(2) == 0:
        add(random.randrange(30, 55), 'stops speaking to someone')
    buries_father = random.randrange(37, 72)
    add(buries_father, 'your father dies', 'father')
    add(min(96, buries_father + random.randrange(0, 15)),
        'your mother dies', 'mother')
    add(66, 'stops going to work')
    if upbringing.raised:
        age, thing = upbringing.raised
        add(age, 'raises it — %s — at someone who was not there' % thing)
    return plan


schedule = build_schedule()


def wrap(prefix, text):
    lines = textwrap.wrap(text, 70 - len(prefix)) or ['']
    out = [prefix + lines[0]]
    out += [' ' * len(prefix) + line for line in lines[1:]]
    return out


def epilogue():
    opening = ['born at %s, owing nothing to anyone, briefly.' % Clock().time()]
    inherited = ', '.join('%s (%s)' % (t, genes.from_whom[t])
                          for t in sorted(genes.given))
    opening += wrap('inherited:  ', inherited + '.')
    if genes.new:
        opening += wrap('new:        ', ', '.join(genes.new) + '.')
    opening += wrap('allotted:   ',
                    '%d years. nobody said so out loud.' % genes.lifespan)

    age, time_of_death = state.died_at or (clock.age, clock.time())
    closing = ['died at %d, at %s, having got up %s times.'
               % (age, time_of_death, '{:,}'.format(state.mornings))]
    if state.cause:
        closing += wrap('           ', 'in the year of %s.' % state.cause)
    closing.append('')
    closing.append('  things done              %11s' % '{:,}'.format(chronicle.total_done))
    closing.append('  thoughts thought         %11s   (%d of them different)'
                   % ('{:,}'.format(chronicle.total_thoughts), len(chronicle.thoughts)))
    closing.append('  alarms obeyed            %11s' % '{:,}'.format(state.alarms))
    closing.append('  things you got round to  %11d' % state.got_round_to)
    closing.append('  nights still awake at three %8s'
                   % '{:,}'.format(state.insomnia_nights))
    if state.worst_night[0]:
        closing.append('  worst of them            %11d   tries, age %d,'
                       ' asleep at %s'
                       % (state.worst_night[0], state.worst_night[1],
                          state.worst_night[2]))
    never = chronicle.done
    never_total = sum(never[n] for n in NEVER_DO)
    favourite = max(NEVER_DO, key=lambda n: never[n])
    closing.append('  things you knew better   %11s'
                   % '{:,}'.format(never_total))
    if never_total:
        closing += wrap('      mostly: ', favourite)
    closing.append('')

    left = [d.name for d in things_you_should_do]
    if left:
        closing.append('still meaning to:')
        for name in left:
            closing.append('    %s' % name)
    else:
        closing.append('nothing left on the list. this is rarer than it sounds.')
    closing.append('')

    if state.world_events:
        closing.append('meanwhile, outside:')
        for when, month, text in state.world_events:
            closing.append('    %3d %s   %s' % (when, MONTHS[month], text))
        closing.append('')

    if age >= 18:
        closing.append('questions left open at school: %d'
                       % len(education.questions))
        if education.not_understood:
            closing += wrap('never understood: ',
                            ', '.join(sorted(set(education.not_understood))) + '.')
    elif age >= 6:
        closing.append('still at school.')
    if upbringing.unresolved:
        closing.append('carried from childhood, the whole way: %d'
                       % len(upbringing.unresolved))
    if upbringing.raised and upbringing.raised[0] <= age:
        when, thing = upbringing.raised
        closing += wrap('let out once: ',
                        'at %d, at someone who had nothing to do with it — %s.'
                        % (when, thing))
    closing.append('')
    closing.append('seed %d — LIFE_SEED=%d to live it again, the same way.'
                   % (fate.seed, fate.seed))
    return {'opening': opening, 'closing': closing}


def account():
    if state.mornings:
        chronicle.render(epilogue())


atexit.register(account)
