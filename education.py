import fate
import random

SUBJECTS = {
    'arithmetic': ["7 x 8", "long division", "the order of operations"],
    'geography': ["the capital of Peru", "the longest river", "oxbow lakes"],
    'history': ["a date", "another date", "why it was inevitable"],
    'biology': ["the parts of a flower", "mitosis", "what the pancreas does"],
    'the other language': ["irregular verbs", "the word for window"],
    'chemistry': ["the periodic table, partly", "why it goes bang"],
    'physics': ["f = ma", "the thing about the pulley"],
    'literature': ["what the poet meant", "the year he died"],
}

# What survives school divides in two, and the model kept confusing them.
# Some of it is a thing you go on doing; the rest is a thing you go on
# knowing, and knowing long division is not an afternoon's activity.
CAN_STILL_DO = [
    "how to look busy",
    "how to sit through things",
]
STILL_KNOWN = [
    "long division",
    "the other language, badly",
    "the word for window",
]
WORTH_KEEPING = CAN_STILL_DO + STILL_KNOWN

memory = {}
questions = []
skills = []
habits = []
known = []
curious_about = random.sample(sorted(SUBJECTS), 2)
grades = []
not_understood = []
whys = 0

def memorize(fact):
    memory[fact] = "until Friday"
    return fact

def forget(fact):
    memory.pop(fact, None)

def study(subject):
    days_left = random.randrange(2, 30)
    while days_left > 1:
        do_something_else()
        days_left -= 1
    for fact in SUBJECTS[subject]:
        memorize(fact)
    for fact in SUBJECTS[subject]:
        if random.randrange(3) > 0:
            forget(fact)

def do_something_else():
    return random.choice(["the phone", "the ceiling", "a nap"])

def exam(subject):
    right = 0
    for question in SUBJECTS[subject]:
        answer = memory.get(question, random.choice(["b", "c", "b"]))
        if answer == "until Friday":
            right += 1
    for fact in SUBJECTS[subject]:
        forget(fact)
    grade = round(1 + 4 * right / len(SUBJECTS[subject]))
    grades.append(grade)
    return grade

def ask(question):
    return ["why " + question for _ in range(random.randrange(2, 4))]

def bell():
    return random.randrange(45) == 0

def understand(subject):
    if subject not in curious_about:
        raise NotImplementedError(subject)
    questions.append("why " + subject)
    while len(questions) > 0:
        if bell():
            break
        question = questions.pop()
        questions.extend(ask(question))

def curiosity():
    asked = 0
    while True:
        asked += 1
        if random.randrange(6) == 0:
            break
        if asked > 500:
            break
    return asked

def graduate():
    for skill in WORTH_KEEPING:
        if random.randrange(3) > 0:
            skills.append(skill)
            (habits if skill in CAN_STILL_DO else known).append(skill)
    return "a certificate stating that you can be taught"

for year in range(12):
    for subject in random.sample(sorted(SUBJECTS), 3):
        study(subject)
        exam(subject)
    if random.randrange(3) == 0:
        try:
            understand(random.choice(sorted(SUBJECTS)))
        except NotImplementedError as it:
            not_understood.append(str(it))
    if random.randrange(4) == 0:
        understand(random.choice(curious_about))

whys = curiosity()
diploma = graduate()
average = sum(grades) / len(grades)
