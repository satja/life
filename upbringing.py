import random
from genes import You, inherit

unresolved = []

def childhood():
    while age < 7:
        watch(parents)
        imitate(parents)
        if hurt:
            try:
                cry()
            except NotInThisHouse:
                unresolved.append(hurt)

def imitate(someone):
    for habit in vars(someone):
        if random.randrange(2) == 0:
            setattr(You, habit, getattr(someone, habit))

def be_told(rule):
    rules.append(rule)
    while not old_enough_to_ask_why:
        obey(rule)
    ask("why")
    if answer == "because I said so":
        break_later(rule)

def learn_the_hard_way(lesson):
    if lesson in what_you_were_told:
        return
    while not burned:
        touch(the_stove)
    what_you_were_told.append(lesson)

def grow_up():
    childhood()
    while len(unresolved) > 0:
        thing = unresolved.pop()
        if random.randrange(10) > 0:
            unresolved.insert(0, thing)
        else:
            raise thing

def become_a_parent():
    while not tired:
        pass
    for habit in dir(You):
        if habit in dir(parents):
            promise_not_to(habit)
    imitate(parents)
