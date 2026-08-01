"""Who and what the thinking is about.

The mind was a list of fifty things. A list of fifty things is not a mind:
it comes round in a fortnight and after that you are only counting. What a
person thinks about is a small number of shapes and a very large number of
particulars — the same worry, about a different name, in a different year.

The shapes are here. The particulars come out of the life being lived, so a
thought is about someone this life actually knew, something it actually owes,
a year it actually had. Nothing here is a lookup table of sentences.

Each shape also says when it points and how it feels, because those two are
the parts of this that anybody has measured. See MEASURED in world.py.
"""

import fate
import random

STAGES = ['infant', 'child', 'teenager', 'young', 'middle', 'later', 'old', 'late']

# when a thought points: behind, at the moment, ahead, or nowhere in
# particular. Mind-wandering is measurably more often ahead than behind.
BEHIND, NOW, AHEAD, ALWAYS = 'behind', 'now', 'ahead', 'always'

ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
        'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
        'sixteen', 'seventeen', 'eighteen', 'nineteen']
TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy',
        'eighty', 'ninety']


def spell(n):
    if n < 20:
        return ONES[n]
    tens, ones = divmod(n, 10)
    return TENS[tens] + ('-' + ONES[ones] if ones else '')


class About:
    """A thing the thinking can be about. Made once, so that a thought which
    comes back comes back in the same words."""

    __slots__ = ('key', 'word', 'kind', 'since', 'gone', 'estranged', 'at')

    def __init__(self, key, word, kind, since=0, at='in'):
        self.key = key
        self.word = word
        self.kind = kind
        self.since = since
        self.gone = None
        self.estranged = False
        self.at = at


def fill(template, who):
    """%s takes the name of the thing; %@ takes it with the preposition that
    goes with it, because nobody stands in the stairs."""
    if '%@' in template:
        return template.replace('%@', '%s %s' % (who.at, who.word))
    return template % who.word


# The shapes. Each is (words, theme, earliest stage, where it points, how it
# feels). A child does not think about what a thing would cost now, so the
# stage matters; the rest is what the shape is.
PERSON = [
    ("whether %s is all right", 'love', 2, NOW, 0),
    ("what %s would say about this", 'shame', 2, AHEAD, 0),
    ("%s, and the thing you did not say", 'love', 3, BEHIND, -1),
    ("ringing %s, at some point", 'love', 3, AHEAD, 0),
    ("whether %s ever thinks about it too", 'love', 2, NOW, 0),
    ("the way %s says your name", 'love', 1, ALWAYS, 1),
    ("what you owe %s, which is not money", 'money', 4, AHEAD, -1),
    ("%s was right, and knew it", 'shame', 4, BEHIND, -1),
    ("whether %s will call", 'love', 5, AHEAD, 0),
    ("being no use to %s", 'shame', 4, NOW, -1),
    ("something %s said that turned out to be true", 'love', 4, BEHIND, 1),
    ("a day out with %s, when it is warmer", 'love', 3, AHEAD, 1),
]
GONE = [
    ("what you never asked %s", 'death', 0, BEHIND, -1),
    ("%s, in the doorway", 'death', 0, BEHIND, 0),
    ("the last thing %s said, or what you have made of it", 'death', 0, BEHIND, 0),
    ("whether %s would know you now", 'death', 0, NOW, 0),
    ("the year %s was still on the phone", 'death', 0, BEHIND, 1),
]
ESTRANGED = [
    ("whether %s would answer", 'shame', 0, AHEAD, 0),
    ("who stopped first, you or %s", 'shame', 0, BEHIND, -1),
    ("what it would take, with %s", 'shame', 0, AHEAD, 0),
]
THING = [
    ("%s, still", 'money', 2, NOW, -1),
    ("getting to %s at the weekend", 'time', 2, AHEAD, 0),
    ("%s, and how long it has been like that", 'shame', 3, BEHIND, -1),
    ("what %s would cost now", 'money', 4, AHEAD, -1),
    ("the afternoon %s is finally done", 'time', 3, AHEAD, 1),
]
PLACE = [
    ("the smell of %s", 'home', 1, ALWAYS, 1),
    ("%s, in the dark", 'fear', 1, ALWAYS, -1),
    ("whether %s is still there", 'home', 4, NOW, 0),
    ("standing %@, doing nothing", 'home', 3, ALWAYS, 1),
    ("going back to %s, one of these years", 'home', 4, AHEAD, 1),
    ("something that happened %@, once", 'home', 4, BEHIND, 0),
]
ACHE = [
    ("the noise %s makes", 'body', 0, NOW, -1),
    ("%s, in the morning", 'body', 0, NOW, -1),
    ("whether %s is getting worse", 'body', 0, AHEAD, -1),
]
YEAR = [
    ("what you said at %s", 'shame', 3, BEHIND, -1),
    ("the summer you were %s", 'time', 3, BEHIND, 1),
    ("how sure you were at %s", 'shame', 4, BEHIND, 0),
    ("being %s again, for an hour", 'time', 5, BEHIND, 1),
]

NAMES = ["Marko", "Vera", "Ivan", "Nada", "Josip", "Ljubica", "Zoran", "Ana",
         "Damir", "Snježana", "Tomislav", "Mira", "Branko", "Dubravka"]
THINGS = ["the tap", "the boxes in the hall", "the documents", "the car",
          "the letter you did not send", "the photograph in the drawer",
          "the coat that still fits", "the money you lent",
          "the shelf that was going to go up"]
# a place carries the preposition that goes with it, because nobody stands
# in the stairs
PLACES = [("the hallway", "in"), ("the stairs", "on"),
          ("the room at the back", "in"), ("the kitchen table", "at"),
          ("the yard", "in"), ("the road out of town", "on"),
          ("the top of the house", "at"), ("the corridor at school", "in"),
          ("the back step", "on")]
ACHES = ["the knee", "the back", "the shoulder", "the tooth", "the hands",
         "the eyes", "the hip"]

# what this life happens to have to think about
people = [About('mother', "your mother", 'person'),
          About('father', "your father", 'person')]
spare = random.sample(NAMES[1:], 10)
things = [About('t%d' % i, w, 'thing')
          for i, w in enumerate(random.sample(THINGS, 4))]
places = [About('p%d' % i, w, 'place', 0, at)
          for i, (w, at) in enumerate(random.sample(PLACES, 4))]
aches = [About('a%d' % i, w, 'ache', random.randrange(26, 62))
         for i, w in enumerate(random.sample(ACHES, 3))]
years = [About('y%d' % n, spell(n), 'year', n + 4)
         for n in sorted(random.sample(range(13, 33), 3))]


# whoever else was in the house. Siblings are there from the start; the
# rest arrive when the life gets round to them.
siblings = [About('sib%d' % i, name, 'person')
            for i, name in enumerate(spare[:random.randrange(0, 3)])]
del spare[:len(siblings)]
people += siblings


def enters(key, word, kind='person', since=0):
    for who in people + things + places:
        if who.key == key:
            return who
    made = About(key, word, kind, since)
    (people if kind == 'person' else things).append(made)
    return made


def someone(age):
    """A name this life has not used yet. Two people in one life may end up
    with the same name, as they do, but not until the names run out."""
    if spare:
        return spare.pop()
    taken = {who.word for who in people}
    left = [n for n in NAMES if n not in taken]
    return random.choice(left or NAMES)


def departs(key, age):
    for who in people:
        if who.key == key:
            who.gone = age


def estrange(age):
    """Whoever you stopped speaking to, it was somebody you had."""
    here = [p for p in people
            if p.gone is None and not p.estranged and p.since <= age
            and p.key not in ('mother', 'child')]
    if here:
        random.choice(here).estranged = True


def departs_named(word, age):
    for who in people:
        if who.word == word:
            who.gone = age


def estrange_named(word):
    for who in people:
        if who.word == word:
            who.estranged = True


def subjects(age):
    """What could be on your mind for the next few years."""
    return [w for w in people + things + places + aches + years
            if w.since <= age and (w.kind != 'person' or w.gone is None
                                   or w.gone <= age)]


def compose(age, stage):
    """Everything this life is in a position to think, said in full."""
    index = STAGES.index(stage)
    out = []

    def take(who, shapes):
        for words, theme, from_stage, points, tone in shapes:
            if index >= from_stage:
                out.append((fill(words, who), theme, who.key, points, tone))

    for who in people:
        if who.since > age:
            continue
        if who.gone is not None:
            take(who, GONE)
        else:
            take(who, PERSON)
            if who.estranged:
                take(who, ESTRANGED)
    for who in things:
        take(who, THING)
    for who in places:
        take(who, PLACE)
    for who in aches:
        if who.since <= age:
            take(who, ACHE)
    for who in years:
        if who.since <= age:
            take(who, YEAR)
    return out
