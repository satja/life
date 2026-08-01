import atexit
import math
import random
import textwrap

import fate
import genes
import upbringing
import education
import history
import memory
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

# What anybody has actually measured about thinking, and what is only a
# shape. Two of these are numbers; two are directions, and the slopes used
# for them here are invented. It is worth knowing which is which.
#
#   WANDERING = 0.469
#       the share of waking moments at which people report thinking about
#       something other than what they are doing. Killingsworth & Gilbert,
#       Science 2010 — 2,250 adults, about 250,000 samples by telephone.
#       Crucially it is a share of moments *while doing something else*, so
#       thinking here costs the clock nothing during the day; only at night,
#       lying down, where there is nothing for it to happen alongside.
#
#   TRANSITIONS = 6200
#       thought transitions in a day, estimated from brain state changes.
#       Tseng & Poppenk, Nature Communications 2020. This model records
#       every thought it has and a life is 29,000 days, so it does not go
#       anywhere near this; a thought here is an episode, not a transition.
#
#   ahead of behind — wandering points forward more often than back, and to
#       the near more often than the far. Direction measured; the 2:1 used
#       here is a round number.
#
#   less with age — mind-wandering declines over a life. Direction measured
#       (Jackson & Balota 2012; Maillet & Schacter 2016); the slope is not.
WANDERING = 0.469
TRANSITIONS = 6200

STAGES = [(76, 'late'), (65, 'old'), (50, 'later'), (35, 'middle'),
          (20, 'young'), (13, 'teenager'), (3, 'child'), (0, 'infant')]

# A day is not a bag you empty; it is a length of time, and things belong to
# parts of it. Anything not named here can happen whenever.
def _dawn(t):      return 5 * 60 <= t < 9 * 60
def _morning(t):   return 6 * 60 <= t < 12 * 60
def _workday(t):   return 8 * 60 <= t < 18 * 60
def _daytime(t):   return 9 * 60 <= t < 19 * 60
def _afternoon(t): return 12 * 60 <= t < 19 * 60
def _evening(t):   return t >= 17 * 60 or t < 2 * 60
def _whenever(t):  return True

BANDS = {'dawn': _dawn, 'morning': _morning, 'workday': _workday,
         'day': _daytime, 'afternoon': _afternoon, 'evening': _evening,
         'any': _whenever}

WHEN = {
    "working": 'workday', "working, still": 'workday', "going to work": 'workday',
    "going back to it": 'workday', "answering messages": 'workday',
    "answering the message": 'workday', "paying the bill": 'workday',
    "looking for work": 'workday', "how to look busy": 'workday',
    "applying": 'workday', "waiting for an answer": 'workday',
    "going to school": 'morning', "handing it in": 'morning',
    "explaining yourself": 'morning', "doing the homework": 'afternoon',
    "studying the night before": 'evening', "lying about homework": 'morning',
    "watching cartoons": 'morning', "playing until it is dark": 'afternoon',
    "riding a bike": 'afternoon', "collecting stones": 'afternoon',
    "running": 'afternoon', "being outside again": 'afternoon',
    "opening the windows": 'morning', "waiting for it to get light": 'dawn',
    "keeping warm": 'evening', "staying in": 'day',
    "watching it get dark early": 'evening', "sitting in the shade": 'afternoon',
    "going to the water": 'day', "lying awake in the heat": 'evening',
    "being at the sea": 'day', "doing nothing, on purpose": 'day',
    "reading half a book": 'afternoon', "eating outside": 'evening',
    "staying up too late": 'evening', "slamming a door": 'evening',
    "looking in the mirror": 'morning', "saying nothing at dinner": 'evening',
    "arguing": 'evening', "listening to the same song": 'evening',
    "drinking too much": 'evening', "going somewhere cheap": 'day',
    "moving out": 'day', "calling home, briefly": 'evening',
    "driving somewhere": 'day', "carrying something heavy": 'day',
    "being needed": 'evening', "seeing fewer friends": 'evening',
    "sleeping badly": 'evening', "cancelling": 'workday',
    "worrying about money": 'evening', "fixing the same thing again": 'afternoon',
    "getting it repaired": 'workday', "taking the bins out": 'evening',
    "looking after someone": 'day', "going to funerals": 'morning',
    "walking for the sake of it": 'afternoon',
    "reading the news too closely": 'morning',
    "having the same argument": 'evening', "putting something aside": 'afternoon',
    "standing in the doorway of a room": 'evening',
    "walking slowly": 'afternoon', "reading the same page twice": 'afternoon',
    "watering the plants": 'morning', "watching the news": 'evening',
    "waiting for the phone": 'day', "telling the story again": 'evening',
    "sitting in the sun": 'afternoon', "going to the doctor": 'morning',
    "going to the check-up": 'morning', "taking the pills": 'morning',
    "being visited": 'afternoon', "sleeping in the afternoon": 'afternoon',
    "not recognising the street": 'day', "looking at photographs": 'evening',
    "waiting": 'day', "sitting": 'afternoon',
    "carrying someone who is asleep": 'evening',
    "reading the same book aloud": 'evening',
    "worrying about someone else": 'evening',
    "renewing the documents": 'workday', "getting it looked at": 'morning',
    "carrying things upstairs": 'day', "queueing": 'morning',
}

# Two numbers that a life carries rather than has: they move slowly, they
# are read by what there is to do and by how easily the world can kill you,
# and nothing in the loop knows their names.
AILMENTS = [
    ("something is found", 3, 0.055,
     [("going to the hospital", 180, 'morning'), ("waiting for the result", 60, 'day'),
      ("taking the pills", 45, 'morning')]),
    ("the operation", 1, 0.050,
     [("lying still", 240, 'any'), ("being visited", 90, 'afternoon'),
      ("learning to walk about again", 60, 'day')]),
    ("the bad winter", 2, 0.018,
     [("staying in", 200, 'day'), ("coughing", 30, 'any')]),
    ("the back goes", 4, 0.0,
     [("lying on the floor", 90, 'any'), ("not lifting anything", 40, 'day')]),
    ("the nerves", 5, 0.0,
     [("not answering the phone", 40, 'day'), ("sitting very still", 120, 'evening')]),
]
# what an age outside does to what is in the bank
COSTS = {'money': -0.22, 'war': -0.16, 'plague': -0.06, 'nature': -0.12,
         'politics': -0.04, 'progress': 0.06}
POOR = [("counting it again", 30, 'evening'), ("going without", 40, 'any'),
        ("the cheaper shop", 45, 'morning'), ("asking for more hours", 25, 'workday')]
COMFORTABLE = [("having it done properly", 90, 'workday'),
               ("going away for a few days", 300, 'day'),
               ("giving some of it away", 30, 'any')]
POORLY = [("resting", 120, 'afternoon'), ("taking it slowly", 60, 'any'),
          ("going to the doctor", 110, 'morning')]
HARD_WORK = {"carrying something heavy", "carrying things upstairs",
             "the long walk", "riding a bike", "running", "going to the water"}

TRADES = ["at the works", "in the office", "on the buses", "in the shop",
          "at the school", "on the site", "in the kitchens", "on the road"]


# what a Saturday is for, which is not what a Tuesday is for
WEEKEND = [("having a lie-in", 55, 'morning'), ("the long walk", 120, 'day'),
           ("seeing people", 150, 'afternoon'), ("the shopping", 90, 'morning'),
           ("mending something", 70, 'afternoon'),
           ("cooking properly", 110, 'evening')]

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

    with_age = round(1.15 - 0.005 * clock.age, 3)
    working['restless'].append(('being %d' % clock.age, 'x', with_age))
    state.dials['restless'] *= with_age

    state.dials['sleep'] = max(0.008, state.dials['sleep'])
    state.dials['persistence'] = min(0.995, state.dials['persistence'])
    state.working = working


RECOVERS = 1 / 26000.0


# when a life of this age goes to bed, and when it gets up. A day is now
# a length of time between the two, and what fits in it is what fits.
BEDTIME = {'infant': 19 * 60, 'child': 20 * 60 + 30, 'teenager': 23 * 60 + 30,
           'young': 23 * 60, 'middle': 22 * 60 + 30, 'later': 22 * 60 + 30,
           'old': 22 * 60, 'late': 21 * 60}
WAKING = {'infant': 6 * 60 + 30, 'child': 7 * 60, 'teenager': 7 * 60,
          'young': 7 * 60, 'middle': 6 * 60 + 45, 'later': 6 * 60 + 45,
          'old': 6 * 60 + 30, 'late': 7 * 60}


def a_weekend(day):
    return day % 7 in (5, 6)


def bedtime(stage, day):
    late = 50 if a_weekend(day) and stage not in ('infant', 'child') else 0
    return BEDTIME[stage] + late + int(random.gauss(0, 40))


def waking(stage, day):
    lie_in = 75 if a_weekend(day) and stage not in ('infant', 'old', 'late') else 0
    return WAKING[stage] + lie_in + int(random.gauss(0, 25))


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


class Day(Pool):
    """What there is to do is what there is to do *now*. Things belong to
    parts of a day, and the pool only offers what belongs to the hour it is.

    live.py asks how long the pool is to decide whether to go round again,
    and asks again to pick something out of it, with the clock moving in
    between. So this can prefer, but it must not refuse: if nothing suits
    the hour it offers everything rather than nothing. What ends the day is
    do(), which empties it when the hour is past."""

    strict = False

    def fitting(self):
        if not state.alive:
            return []
        now = clock.minute % MINUTES_PER_DAY
        fits = [d for d in list.__iter__(self) if BANDS[d.band](now)]
        if not fits and not self.strict:
            # nothing suits the hour, so anything that suits any hour will do
            fits = [d for d in list.__iter__(self) if d.band == 'any']
            fits = fits or list(list.__iter__(self))
        # and nobody starts a day's work at eight in the evening
        room = state.day_ends - clock.minute
        return [d for d in fits if d.minutes <= room + 20] or fits

    def __len__(self):
        return len(self.fitting())

    def __getitem__(self, index):
        if isinstance(index, slice):
            return list.__getitem__(self, index)
        return self.fitting()[index]


class MustDo(Day):
    """What you really must do can wait for the right hour; nobody renews
    the documents at eleven at night."""

    strict = True


def at_this_hour(thoughts):
    """Three in the morning is not nine in the morning. What is available to
    think is the same; what comes to hand is not."""
    hour = (clock.minute % MINUTES_PER_DAY) // 60
    if hour >= 22 or hour < 5:
        leaning = [t for t in thoughts if t.points == 'behind' or t.tone < 0]
    elif hour < 11:
        leaning = [t for t in thoughts if t.points == 'ahead']
    else:
        return thoughts
    return leaning + leaning + thoughts if leaning else thoughts


class Mind(Pool):
    """live.py adds the two halves of the mind together and picks out of the
    sum. The sum is not the same at four in the morning."""

    def __add__(self, other):
        return at_this_hour(list.__add__(list(self), list(other)))


class Temptations(Pool):
    def __len__(self):
        return Pool.__len__(self) if state.tempted else 0


class Reproach(Pool):
    def __len__(self):
        return Pool.__len__(self) if state.reminded else 0


class Doing:
    __slots__ = ('name', 'kind', 'minutes', 'band')

    def __init__(self, name, kind, minutes, band=None):
        self.name = name
        self.kind = kind
        self.minutes = minutes
        self.band = band or WHEN.get(name, 'any')


class Thought:
    __slots__ = ('text', 'theme', 'about', 'points', 'tone')

    def __init__(self, text, theme, about=None, points='always', tone=0):
        self.text = text
        self.theme = theme
        self.about = about
        self.points = points
        self.tone = tone


class State:
    def __init__(self):
        self.alive = True
        self.grogginess = 0
        self.day_ends = 22 * 60
        self.health = 1.0
        self.money = 0.5
        self.job = None
        self.years_in_job = 0
        self.idle = 0
        self.lying = False
        self.tempted = False
        self.reminded = False
        self.sleep_attempts = 0
        self.woke_at = 0
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

things_you_can_do = Day()
things_you_really_must_do = MustDo()
things_you_should_do = Reproach()
things_you_should_never_do = Temptations()
consciousness = Mind()
subconsciousness = Mind()
by_theme = {}
by_subject = {}


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
    age = clock.age
    name = stage_at(age)
    thoughts = [(t, m, None, 'always', 0) for t, m in THOUGHTS[name]]
    for circumstance in state.circumstances:
        thoughts += [(t, m, None, 'now', 0) for t, m in circumstance['thinks']]
    thoughts += memory.compose(age, name)
    # live.py draws from the pool uniformly, so a bias can only be a number
    # of copies of a thing in it. The shapes come out at about three thoughts
    # forward for every two back on their own; the pleasant ones need a
    # thumb, because otherwise a life here is more rueful than the sampling
    # work says a life is.
    thoughts += [t for t in thoughts if t[4] > 0]

    # a preoccupation is a subject, not a sentence: for a few years more of
    # what you think is about the same person, or the same unpaid thing
    subjects = memory.subjects(age)
    if subjects and (not state.preoccupation or state.preoccupation[1] <= age):
        state.preoccupation = (random.choice(subjects).key,
                               age + random.randrange(2, 8))
    if state.preoccupation:
        on = state.preoccupation[0]
        thoughts += [t for t in thoughts if t[2] == on]
    consciousness[:] = [Thought(t, m, a, p, v) for t, m, a, p, v in thoughts]
    subconsciousness[:] = [Thought(t, m) for t, m, since in DEEP
                           if age >= since] + list(state.scars)
    things_you_should_never_do[:] = [
        Doing(n, 'never', random.randrange(5, 40))
        for n in (NEVER_DO if age >= 13 else [])]
    by_theme.clear()
    by_subject.clear()
    for thought in list(consciousness) + list(subconsciousness):
        by_theme.setdefault(thought.theme, []).append(thought)
        if thought.about:
            by_subject.setdefault(thought.about, []).append(thought)


def related(thought):
    if thought.about and random.randrange(3) > 0:
        near = by_subject.get(thought.about)
        if near:
            return at_this_hour(near)
    return at_this_hour(by_theme.get(thought.theme) or list(consciousness))


def think(thought):
    # while you are up you are already doing something, so the thought does
    # not stop the day; it colours a stretch of it, and that stretch is what
    # the sampling work is counting. Lying down there is nothing alongside
    # it, and then it costs the clock what it costs.
    if state.lying:
        clock.tick(random.randrange(1, 4))
    else:
        chronicle.wandering += random.randrange(2, 8)
    state.idle -= 1
    chronicle.thought(clock.age, clock.month, thought.text,
                      thought.points, thought.tone)


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
    state.idle += round(random.randrange(4, 13) * state.dials['restless'])
    # the day is over when the hour says so, and not when the bag is empty.
    # Emptying it here is safe: live.py has made its choice for this lap.
    if thing.kind == 'can' and clock.minute >= state.day_ends:
        del things_you_can_do[:]
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
    if clock.minute >= state.day_ends:
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
    chronicle.waking += max(0, clock.minute - state.woke_at)
    if state.insomnia_noted and state.sleep_attempts > state.worst_night[0]:
        state.worst_night = (state.sleep_attempts, clock.age, clock.time())
    tomorrow = state.day_index + 1
    target = tomorrow * MINUTES_PER_DAY + waking(state.stage or 'young', tomorrow)
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
    state.woke_at = clock.minute

    age = clock.age
    if age != state.year_seen:
        state.year_seen = age
        birthday(age)
    if not state.alive:
        things_you_can_do[:] = []
        return
    if clock.month != state.month_seen:
        new_month()

    stage = state.stage
    state.day_ends = state.day_index * MINUTES_PER_DAY + bedtime(stage, clock.day)
    if state.day_ends <= clock.minute + 90:
        state.day_ends = clock.minute + 90

    doy = clock.day % DAYS_PER_YEAR
    away = state.holiday_from <= doy < state.holiday_to
    weekend = a_weekend(clock.day)
    pool = state.choices
    if away:
        pool = [c for c in pool
                if c[0] not in WORK and c[0] not in TERM_ONLY] + HOLIDAY
    elif weekend:
        # nobody goes to work on a Sunday, and Saturday has its own things
        pool = [c for c in pool if c[0] not in WORK and c[0] not in SCHOOL
                and c[0] not in TERM_ONLY]
        pool = pool + [(n, m) for n, m, b in WEEKEND
                       if WHEN.setdefault(n, b) or True]
    elif age < 20 and 172 <= doy < 244:
        pool = [c for c in pool if c[0] not in TERM_ONLY]
    # more is offered than the day can hold, because the day is what runs out
    offered = min(len(pool), energy_at(age) + (5 if full else 3))
    things_you_can_do[:] = [
        Doing(n, 'can', m) for n, m in weighted_pick(pool, max(1, offered))]

    if (not away and not weekend and len(things_you_really_must_do) < 9
            and random.randrange(2) == 0):
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
         'kind': event.kind, 'does': event.does, 'thinks': event.thinks,
         'costs': COSTS.get(event.kind, 0.0)})
    if event.kind == 'work' and state.job:
        # the works closing is not a mood; it is the end of a wage
        state.job = None
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
    if isinstance(key, tuple):
        take_household(key, age)
        return
    if key == 'school':
        memory.enters('school1', "Marko", 'person', age)
        memory.enters('school2', memory.someone(age), 'person', age)
    elif key == 'work':
        state.job = random.choice(TRADES)
        once(age, 'starts %s' % state.job)
        memory.enters('work1', memory.someone(age), 'person', age)
    elif key == 'loved':
        memory.enters('loved', memory.someone(age), 'person', age)
    elif key == 'retires':
        state.job = None
    elif key == 'estranged':
        memory.estrange(age)
    elif key == 'parent':
        state.circumstances.append(
            {'text': 'a child', 'until': age + 18, 'risk': 0.0,
             'kind': 'child',
             'does': [("carrying someone who is asleep", 60),
                      ("reading the same book aloud", 30),
                      ("worrying about someone else", 45)],
             'thinks': []})
        memory.enters('child', "the child", 'person', age)
    elif key == 'father':
        memory.departs('father', age)
        remember("the silence at the table", 'death')
    elif key == 'mother':
        memory.departs('mother', age)
        remember("the hallway, empty", 'death')
        state.no_longer_possible.add("call your mother")
        for item in list(things_you_should_do):
            if item.name == "call your mother":
                things_you_should_do.remove(item)


def take_household(what, age):
    kind = what[0]
    if kind == 'meet':
        memory.enters('partner', what[1], 'person', what[2])
    elif kind == 'movein':
        state.circumstances.append(
            {'text': 'living with %s' % what[1], 'until': 200, 'risk': 0.0,
             'kind': 'household',
             'does': [("cooking properly", 110), ("the same argument", 35),
                      ("going somewhere together", 180),
                      ("sitting in the same room, not talking", 60)],
             'thinks': []})
    elif kind == 'parted':
        drop_circumstance('household')
        memory.estrange_named(what[1])
        remember("the door, and then the stairs", 'love')
        alone()
    elif kind == 'bereaved':
        drop_circumstance('household')
        memory.departs_named(what[1], age)
        remember("the other side of the bed", 'death')
        alone()
    elif kind == 'born':
        memory.enters(what[1], what[1], 'person', what[2])
        state.circumstances.append(
            {'text': 'a small child', 'until': age + 6, 'risk': 0.0,
             'kind': 'child',
             'does': [("carrying someone who is asleep", 60),
                      ("reading the same book aloud", 30),
                      ("being up in the night", 45),
                      ("worrying about someone else", 45)],
             'thinks': []})
    elif kind == 'school-age':
        state.circumstances.append(
            {'text': 'a child at school', 'until': age + 12, 'risk': 0.0,
             'kind': 'child',
             'does': [("the school run", 40), ("helping with the homework", 45),
                      ("being shouted at by someone small", 20),
                      ("worrying about someone else", 45)],
             'thinks': []})
    elif kind == 'leaves':
        drop_circumstance('child')
        state.circumstances.append(
            {'text': 'the room at the back, empty', 'until': age + 4,
             'risk': 0.0, 'kind': 'quiet',
             'does': [("standing in the doorway of a room", 15),
                      ("ringing them, briefly", 14)],
             'thinks': []})


def drop_circumstance(kind):
    state.circumstances = [c for c in state.circumstances
                           if c.get('kind') != kind]


def alone():
    state.circumstances.append(
        {'text': 'living alone', 'until': 200, 'risk': 0.0, 'kind': 'alone',
         'does': [("eating standing up", 20), ("leaving the radio on", 90),
                  ("nobody to tell", 30)],
         'thinks': []})


def keep_the_books(age):
    """Health and money are not dials — the loop never reads them by name.
    They are read by what there is to do, and by how easily a bad year can
    kill you, which is the same thing as being read by the loop."""
    wear = 0.0 if age < 35 else (age - 35) * 0.0009
    ill = sum(0.04 for c in state.circumstances if c.get('kind') == 'ailment')
    state.health = min(1.0, max(0.05, state.health - wear - ill + 0.015))

    # money is a level and not a heap: it is what you are living on, and it
    # pulls towards what you are living on it from
    if age < 18:
        target = 0.5                       # what the house has, not what you have
    elif age >= 66:
        target = 0.42
    else:
        earning = state.job is not None and not any(
            c.get('kind') == 'work' for c in state.circumstances)
        state.years_in_job = state.years_in_job + 1 if earning else 0
        target = (0.46 + min(0.22, state.years_in_job * 0.011)) if earning else 0.24
    target -= 0.05 * sum(1 for c in state.circumstances
                         if c.get('kind') == 'child')
    state.money += (target - state.money) * 0.3 + random.gauss(0, 0.02)
    for circumstance in state.circumstances:
        if circumstance.get('costs'):
            state.money += circumstance['costs']
            circumstance['costs'] = 0.0
    state.money = min(1.0, max(0.02, state.money))

    if age >= 20 and random.random() < ailment_chance(age):
        text, years, risk, does = random.choice(AILMENTS)
        if not any(c['text'] == text for c in state.circumstances):
            state.circumstances.append(
                {'text': text, 'until': age + years, 'kind': 'ailment',
                 'risk': risk * (2.0 - state.health), 'does': does,
                 'thinks': [], 'costs': -0.05})
            once(age, text)
            remember(text, 'body')


def ailment_chance(age):
    base = 0.006 + max(0, age - 35) * 0.0018
    return base * (2.0 - state.health)


def birthday(age):
    state.circumstances = [c for c in state.circumstances if c['until'] > age]
    for event in history.starting(age):
        take_place(event)
    keep_the_books(age)
    wind_up()
    if age > genes.lifespan:
        die(age, None)
        return
    for circumstance in state.circumstances:
        chance = (circumstance['risk'] * frailty(age) * state.dials['frailty']
                  * (2.0 - state.health))
        if chance and random.random() < chance:
            die(age, circumstance['text'])
            return
    state.pending = [(random.randrange(12), text, effect)
                     for text, effect in schedule.pop(age, [])]
    offer_something_you_should_do(age)
    state.stage = stage_at(age)
    # what school left you is kept or it is not, and once it has gone it has
    # gone. It used to be redrawn every year, so long division came and went
    # like weather, which is not what happens to long division.
    if age == 20:
        state.skills_kept = [s for s in education.skills if random.randrange(3) > 0]
    elif age > 20:
        state.skills_kept = [s for s in state.skills_kept if random.random() < 0.96]
    state.month_seen = -1
    if 5 <= age < 66:
        state.holiday_from = random.randrange(176, 232)
        state.holiday_to = state.holiday_from + random.randrange(12, 25)
    else:
        state.holiday_from = state.holiday_to = -1
    refresh_mind()


def restock():
    choices = list(CAN_DO[state.stage])
    choices += [(s, 45) for s in state.skills_kept
                if s in education.CAN_STILL_DO]
    for circumstance in state.circumstances:
        choices += circumstance['does']
    choices += SEASON[SEASONS[clock.month]]
    if state.money < 0.35:
        choices += POOR
        choices = [c for c in choices if c[0] not in
                   ("going somewhere cheap", "being at the sea", "eating outside")]
    elif state.money > 0.72:
        choices += COMFORTABLE
    if state.health < 0.62:
        choices += POORLY
        choices = [c for c in choices if c[0] not in HARD_WORK]
    already = set()
    distinct = []
    for entry in choices:
        name, minutes = entry[0], entry[1]
        if len(entry) > 2:
            # a thing that arrives with a circumstance says when it happens
            WHEN.setdefault(name, entry[2])
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
    add(6, 'starts school', 'school')
    add(18, 'leaves school with ' + education.diploma)
    add(18, 'average mark: %.1f' % education.average)
    add(random.randrange(15, 20), 'falls in love, silently', 'loved')
    add(random.randrange(19, 26), 'first job', 'work')
    add(random.randrange(20, 29), 'moves out for good')
    # somebody to live with, which the model had no room for at all
    met = random.randrange(19, 34)
    them = memory.someone(met)
    add(met, 'meets %s' % them, ('meet', them, met))
    moved = met + random.randrange(1, 5)
    add(moved, 'moves in with %s' % them, ('movein', them))
    for i in range(random.choice([0, 1, 1, 1, 2, 2, 3])):
        born = moved + random.randrange(1, 12)
        name = memory.someone(born)
        add(born, '%s is born' % name, ('born', name, born))
        add(born + 6, '%s starts school' % name, ('school-age', name, born))
        add(born + random.randrange(18, 27), '%s leaves home' % name,
            ('leaves', name))
    ending = random.randrange(5)
    if ending == 0:
        add(moved + random.randrange(6, 31), 'it ends, with %s' % them,
            ('parted', them))
    elif ending == 1:
        add(moved + random.randrange(22, 51), '%s dies first' % them,
            ('bereaved', them))
    if random.randrange(2) == 0:
        add(random.randrange(30, 55), 'stops speaking to someone', 'estranged')
    buries_father = random.randrange(37, 72)
    add(buries_father, 'your father dies', 'father')
    add(min(96, buries_father + random.randrange(0, 15)),
        'your mother dies', 'mother')
    add(66, 'stops going to work', 'retires')
    if upbringing.raised:
        age, thing = upbringing.raised
        add(age, 'raises it — %s — at someone who was not there' % thing)
    return plan


memory.taught(education.known)
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
    if chronicle.waking:
        pointing = sum(chronicle.points.values()) or 1
        closing.append('  what you were living on   %10.0f%%   of the health you '
                       'started with, %.0f%% of what there is to have'
                       % (100 * state.health, 100 * state.money))
        closing.append('  mind somewhere else      %10.0f%%   (measured 46.9%%: '
                       'Killingsworth & Gilbert, Science 2010)'
                       % (100.0 * chronicle.wandering / chronicle.waking))
        closing.append('      of it, %.0f%% pointed ahead and %.0f%% behind; '
                       '%.0f%% was pleasant, %.0f%% was not.'
                       % (100.0 * chronicle.points['ahead'] / pointing,
                          100.0 * chronicle.points['behind'] / pointing,
                          100.0 * chronicle.tone[1] / pointing,
                          100.0 * chronicle.tone[-1] / pointing))
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
