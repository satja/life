import fate
import random

class Event:
    def __init__(self, text, kind, years, weight,
                 does=(), thinks=(), risk=0.0, costs=None, repeats=False):
        self.text = text
        self.kind = kind
        self.years = years
        self.weight = weight
        self.does = list(does)
        self.thinks = list(thinks)
        self.risk = risk
        self.costs = costs
        self.repeats = repeats

WORLD = [
    Event("the government falls", 'politics', 1, 10, repeats=True,
          does=[("listening for news", 40), ("queueing", 60)],
          thinks=[("whether it makes any difference", 'politics')]),
    Event("a new government, much like the last", 'politics', 2, 9, repeats=True,
          does=[("listening for news", 30)],
          thinks=[("whether it makes any difference", 'politics')]),
    Event("the currency is reformed", 'money', 2, 6,
          does=[("counting it again", 30), ("queueing", 90)],
          thinks=[("what it used to cost", 'money')]),
    Event("prices double, and then double", 'money', 3, 7, repeats=True,
          does=[("going without", 45), ("counting it again", 25)],
          thinks=[("what it used to cost", 'money')]),
    Event("the factory closes", 'money', 4, 6,
          does=[("looking for work", 180), ("waiting for an answer", 60)],
          thinks=[("whether this is the job", 'work')],
          costs="find out what happened to Marko"),
    Event("the border closes", 'politics', 6, 4,
          does=[("staying put", 30)],
          thinks=[("getting out of here", 'time')]),
    Event("the border opens", 'politics', 1, 4,
          does=[("going to look at it", 240)],
          thinks=[("getting out of here", 'time')]),
    Event("war, somewhere else", 'war', 3, 7, repeats=True,
          does=[("watching the news", 90), ("sending what you can", 20)],
          thinks=[("everyone in this photograph is older now", 'death')]),
    Event("war, here", 'war', 4, 4, risk=0.07,
          does=[("queueing", 120), ("listening for the all-clear", 60),
                ("boarding up the windows", 45)],
          thinks=[("the light in a hospital corridor", 'death'),
                  ("whether they are all right", 'love')],
          costs="find out what happened to Marko"),
    Event("the river takes the lower streets", 'nature', 1, 5, risk=0.02,
          does=[("carrying things upstairs", 90), ("drying it out", 120)],
          thinks=[("water, further out than you thought", 'fear')]),
    Event("an earthquake, in the night", 'nature', 1, 4, risk=0.035,
          does=[("sleeping in the car", 300), ("queueing", 60)],
          thinks=[("the stairs in the dark", 'fear')],
          costs="get it looked at"),
    Event("the summer that would not end", 'nature', 1, 6, risk=0.018,
          repeats=True,
          does=[("sitting in the dark with the shutters closed", 140)],
          thinks=[("it is August already", 'time')]),
    Event("a winter with no coal", 'nature', 1, 5, risk=0.025, repeats=True,
          does=[("keeping one room warm", 150)],
          thinks=[("the smell of the hallway", 'home')]),
    Event("everyone stays indoors for a year", 'plague', 2, 4, risk=0.03,
          does=[("staying indoors", 300), ("waiting for the phone", 60)],
          thinks=[("whether they are all right", 'love')]),
    Event("a bridge is built", 'progress', 1, 5, repeats=True,
          does=[("going the new way", 40)]),
    Event("the mill is turned into flats", 'progress', 1, 5,
          thinks=[("what it used to be", 'home')]),
    Event("the trams stop running", 'progress', 2, 4,
          does=[("walking it instead", 70)]),
]

def pick(candidates):
    total = sum(event.weight for event in candidates)
    cut = random.uniform(0, total)
    for event in candidates:
        cut -= event.weight
        if cut <= 0:
            return event
    return candidates[-1]

def unfold(span=101):
    happened = []
    spent = set()
    age = 2
    while age < span:
        if random.random() < 0.075:
            candidates = [e for e in WORLD if e.repeats or e.text not in spent]
            if not candidates:
                break
            event = pick(candidates)
            happened.append((age, event))
            spent.add(event.text)
            age += max(1, event.years)
        else:
            age += 1
    return happened

timeline = unfold()

def starting(age):
    return [event for start, event in timeline if start == age]
