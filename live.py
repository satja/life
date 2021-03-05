import random
from mind import think_about

def wake_up():
    while still_sleepy:
        if must_wake_up:
            do_whatever_it_takes_to_get_up()
            return
        else:
            pass
    get_up()

def sleep():
    while not lying_down:
        pass
    attempts = 0
    while fall_asleep() == False:
        think_about_stuff()

        attempts += 1
        if attempts == 50:
            get_frustrated()
        if attemtps > 50:
            continue_to_be_frustrated()
        if morning:
            insomnia = True

def think_about_stuff():
    thought = random.choice(subconsciousness + consciousness + ['anna-maria'])
    while have_nothing_to_do:
        think_about(thought)
        if random.randrange(10) > 0:
            thought = random.choice(related(thought))
        else:
            thought = random.choice(subconsciousness + consciousness + ['anna-maria'])

def live():
    while len(things_you_can_do) > 0:
        think_about('anna-maria')

        if len(things_you_really_must_do) > 0:
            if random.randrange(2) == 0:
                thing = random.choice(things_you_really_must_do)
                do(thing)

        think_about('♥')

        if len(things_you_should_do) > 0:
            if random.randrange(3) == 0:
                thing = random.choice(things_you_should_do)
                do(thing)

        think_about('anna-maria')

        if len(things_you_should_never_do) > 0:
            if random.randrange(4) == 0:
                thing = random.choice(things_you_should_never_do)
                do(thing)

        think_about('♥')

        thing = random.choice(
                things_to_do_with('anna-maria') + things_to_do_for('anna-maria'))
        do(thing)
        
        think_about('anna-maria')

    # rename this function
    live.__name__[1] = 'o'


if True:
    # rename the whole module live.py
    __name__[1] = 'o'
