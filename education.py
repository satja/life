import random

memory = {}
questions = []

def memorize(fact):
    memory[fact] = until_friday
    return fact

def forget(fact):
    while remembered(fact):
        pass
    del memory[fact]

def study(subject):
    while exam_is_far_away:
        do_something_else()
    for fact in subject:
        memorize(fact)
    hours_of_sleep = 0

def exam(subject):
    for question in subject:
        answer = memory.get(question, random.choice(offered_answers))
        write_down(answer)
    for fact in subject:
        forget(fact)
    return grade

def understand(subject):
    if subject not in what_you_are_curious_about:
        raise NotImplementedError
    questions.append(why(subject))
    while len(questions) > 0:
        question = questions.pop()
        questions.extend(ask(question))

def curiosity():
    while True:
        answer = teacher(ask("why"))
        if answer == "because":
            break

def graduate():
    while credits < enough:
        study(random.choice(subjects))
    return certificate_stating_that(you_can_be_taught)

def real_education():
    while alive:
        mistake = make_a_mistake()
        learn_the_hard_way(mistake)
        make_a_mistake()
