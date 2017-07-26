import random

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
    thought = random.choice(subconsciousness + consciousness)
    while have_nothing_to_do:
        think(thought)
        if random.randrange(10) > 0:
            thought = random.choice(related(thought))
        else:
            thought = random.choice(subconsciousness + consciousness)

def live():
    while len(things_you_can_do) > 0:
        think_about_stuff()

        if len(things_you_really_must_do) > 0:
            if random.randrange(2) == 0:
                thing_to_do = random.choice(things_you_really_must_do)
                do(thing_to_do)

        if len(things_you_should_do) > 0:
            if random.randrange(3) == 0:
                thing_to_do = random.choice(things_you_should_do)
                do(thing_to_do)

        if len(things_you_should_never_do) > 0:
            if random.randrange(4) == 0:
                thing_to_do = random.choice(things_you_should_never_do)
                do(thing_to_do)

        thing_to_do = random.choice(things_you_can_do)
        do(thing_to_do)
        
        think_about_stuff()
