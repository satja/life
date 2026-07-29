import random
from copy import copy

class Ancestor:
    fear_of_the_dark = True
    hope = True

class Grandmother(Ancestor):
    stubbornness = 0.8
    recipe = "never written down"

class Grandfather(Ancestor):
    silence = "long"

class Mother(Grandmother, Grandfather):
    worry = float('inf')

class Father(Grandmother, Grandfather):
    posture = "bad"

class You(Mother, Father):
    pass

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
    if random.randrange(1000000) == 0:
        return something_nobody_has_had_before()
    return None

def express(trait):
    if dominant(trait):
        return inherit(trait)
    while not under_pressure:
        pass
    return inherit(trait)

def eyes():
    return random.choice([Mother.eyes, Father.eyes])

def everything_else():
    return Mother.everything_else

def descendants():
    while True:
        yield type('You', (You,), {})
