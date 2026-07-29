import fate
import random
from copy import copy

class Ancestor:
    hope = True
    fear_of_the_dark = True
    eyes = "brown"
    worry = "about the winter"
    silence = "the kind you are born into"
    posture = "from carrying things"

class Grandmother(Ancestor):
    stubbornness = True
    recipe = "never written down"
    worry = "about money"

class Grandfather(Ancestor):
    silence = "long"
    patience = True

class Mother(Grandmother, Grandfather):
    worry = float('inf')
    eyes = "green"
    everything_else = "hers"

class Father(Grandmother, Grandfather):
    posture = "bad"
    eyes = "grey"
    silence = "at the table"

class You(Mother, Father):
    pass

TRAITS = ['hope', 'fear_of_the_dark', 'stubbornness', 'worry', 'posture',
          'silence', 'recipe', 'eyes', 'patience', 'a way with people']

new = []

def inherit(trait):
    for ancestor in You.__mro__:
        if trait in vars(ancestor):
            return copy(vars(ancestor)[trait])
    return mutate(trait)

def blame(trait):
    for ancestor in reversed(You.__mro__):
        if trait in vars(ancestor):
            return ancestor
    return You

def mutate(trait):
    if random.randrange(300) == 0:
        new.append(trait)
        return "yours"
    return None

def dominant(trait):
    return random.randrange(3) > 0

def under_pressure():
    return random.randrange(2) == 0

def express(trait):
    if dominant(trait):
        return inherit(trait)
    if not under_pressure():
        return None
    return inherit(trait)

def eyes():
    return random.choice([Mother.eyes, Father.eyes])

def everything_else():
    return Mother.everything_else

def descendants():
    while True:
        yield type('You', (You,), {})

given = {trait: express(trait) for trait in TRAITS}
given = {trait: value for trait, value in given.items() if value is not None}
from_whom = {trait: blame(trait).__name__ for trait in given}

lifespan = 68 + random.randrange(-11, 22)
if 'stubbornness' in given:
    lifespan += 4
if 'worry' in given:
    lifespan -= 2
