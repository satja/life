import fate
import random
from genes import You, Mother, Father

class NotInThisHouse(Exception):
    pass

class Unresolved(Exception):
    pass

parents = (Mother, Father)

SMALL_THINGS = [
    "being laughed at by the whole table",
    "the door closing",
    "not being believed",
    "coming last, in front of everyone",
    "the word he used",
    "a promise about Saturday",
    "the silence after the question",
    "being told you were fine",
]

unresolved = []
imitated = []
raised = None

def watch(people):
    for someone in people:
        for habit in vars(someone):
            if not habit.startswith('_'):
                pass

def imitate(someone):
    for habit in list(vars(someone)):
        if habit.startswith('_'):
            continue
        if random.randrange(2) == 0:
            setattr(You, habit, getattr(someone, habit))
            imitated.append((someone.__name__, habit))

def something_small():
    if random.randrange(3) > 0:
        return None
    return random.choice(SMALL_THINGS)

def cry(hurt):
    if random.randrange(3) == 0:
        raise NotInThisHouse(hurt)
    return "seen to"

def be_told(rule):
    while random.randrange(4) > 0:
        obey(rule)
    return ask("why")

def obey(rule):
    return rule

def ask(question):
    return "because I said so"

def learn_the_hard_way(lesson):
    burned = False
    while not burned:
        burned = random.randrange(2) == 0
    return lesson

def childhood():
    age = 0
    while age < 7:
        watch(parents)
        imitate(random.choice(parents))
        hurt = something_small()
        if hurt:
            try:
                cry(hurt)
            except NotInThisHouse:
                unresolved.append(hurt)
        age += 1

def grow_up():
    global raised
    childhood()
    age = 17
    while len(unresolved) > 0:
        thing = unresolved.pop()
        age += 1
        if age > 79:
            return
        if random.randrange(10) > 0:
            unresolved.insert(0, thing)
        else:
            raised = (age, thing)
            raise Unresolved(thing)

def become_a_parent():
    for habit in dir(You):
        if habit in dir(parents[0]):
            promised_not_to.append(habit)
    imitate(random.choice(parents))

promised_not_to = []

try:
    grow_up()
except Unresolved:
    pass
