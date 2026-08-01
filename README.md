# Life

A Pythonic description of life.
Start with "main.py" and see what's there.

It runs now.

    $ python3 main.py

It prints one life, from the first morning to the last, and then what it
came to — a row per month, about a thousand of them. Every run is a different
life. To live the same one twice:

    $ LIFE_SEED=33 python3 main.py

For one row per year instead, which is shorter and shows the shape better:

    $ LIFE_DETAIL=year python3 main.py

There is also a web version in "web/". You set the conditions — the century,
conscience, temptation, sleep, and the seed — and run one life. It is one
row, drawn at every scale, and you see only what happened in it:

    43   the factory closes                                    middle
      jan  the factory closes                                    402 h
        1 jan  the factory closes                          07:24-21:09
          19:10  looking for work                               180 min
                 whether this is the job
      ... 25 more

Every year is there and every year opens, including the ones nothing
happened in. Open a year and you get its months, a month
and you get its days, a day and you get the things you did, a thing and you
get the thoughts you had on the way to it. Below the year the rule is the
same at every depth: the children something happened in are shown, the rest
are counted. What is left after the last thing done belongs to the night,
which is where the thinking goes that the day had no room for.

A year also holds the six numbers the loop was reading while it passed, and
each of them opens into its working — the base the knobs set, then what
leans on it, and where it is read:

    sleep = 0.0080                                    read at live.py:17
        0.0200   base
       -0.0100   fear_of_the_dark (Ancestor)
       -0.0180   worry (Ancestor)
        0.0080   as far as it is allowed to go

The account at the end goes the other way: a trait opens into the dials it
turns, and each says which line reads it.

The commentary is Croatian and English; the program and everything it says
stay in the language it was written in.

Build with "python3 web/build.py", which writes "web/life.html" and
"docs/index.html". GitHub Pages serves the /docs folder at
https://life.blogaritam.com/ — one file, loading nothing from anywhere.
"docs/CNAME" holds the custom domain and is not touched by the build.

Feel free to contribute.


# Modules

"fate.py" — the seed. Imported first by everything, which is the point.

"genes.py" — what you got. Multiple inheritance, resolved in the usual order.

"upbringing.py" — what was done about it.

"education.py" — what was done instead.

"history.py" — what was going on at the time, which was not about you.

"memory.py" — who and what the thinking is about.

"world.py" — everything live.py assumes and does not define.

"live.py" — the main loop.

"trajectory.py" — the account, printed afterwards, by something else.


# How it runs

"live.py" is unchanged except for one import. Its loops were always correct;
what was missing was a world in which they terminate. So the names it uses
are objects rather than values:

- "still_sleepy", "lying_down", "morning" and the rest are conditions, and
  checking one costs a minute. That is why "while still_sleepy: pass" ends —
  time passes because you asked.
- "things_you_can_do" empties as the day is spent, and is refilled by getting
  up. On the last morning it is not refilled, and "live()" returns immediately.
- "things_you_should_never_do" has a length of zero unless you are tempted.
- "things_you_should_do" has a length of zero unless you happen to remember it,
  which over a lifetime is about eight times.
- "dead" is a condition, so "main.py" does not have to set it.

What you can do on a given day is drawn from the pool by weight, and the
weights wander from month to month and pull slowly back towards where they
started. This is why a stretch of years has a character, and why it passes.

Months are worth printing only because they differ. The seasons put their own
things in the pool — opening the windows in spring, lying awake in the heat,
going back to it in October, keeping warm and waiting for it to get light —
and everything that happens to you is dated to a month rather than to a
birthday. Without that a monthly row would be a yearly row twelve times.

"history.py" runs on its own schedule and does not consult you. Most of it
you only read about. Some of it changes what there is to do for a few years —
a factory closes and you are looking for work, the river comes up and you are
carrying things upstairs. A little of it can kill you, more easily when you
are very young or very old. About one life in ten ends this way.

"genes", "upbringing" and "education" do their work at import time, before the
loop starts. This is not a workaround.


# The day, the week, and the house

A day used to be a bag: live() ran until "things_you_can_do" was empty, so
the length of the day was whatever the bag happened to hold. The measured
result was absurd — the commonest bedtime was five in the afternoon, a
quarter of days held more than sixteen hours of activity, and Saturday was
the heaviest working day of the week.

The day is a length of time now, and things belong to parts of it. Nobody
starts a day's work at eight in the evening, nobody renews the documents at
eleven at night, and "waiting for it to get light" happens at dawn. The pool
offers what suits the hour; it prefers but never refuses, because live.py
asks how long the pool is to decide whether to go round again and asks again
to pick something out of it, with the clock moving in between. What ends the
day is "do()", which empties the pool once the hour is past. So the loop
still ends when there is nothing to do — it is just that now there is
nothing to do because the day is over rather than the other way round.

Weekends exist. Work and school are not in the pool on a Saturday, and a
Saturday has its own things: the long walk, the shopping, seeing people,
cooking properly.

A life also has somebody in it. It meets someone in its twenties, moves in
with them a year or four later, may have children who are born, start
school, and leave home, and may be left or bereaved. Each of those is a
circumstance like a war: it puts its own things in the pool and takes them
out again. The room at the back is empty for four years after the last one
goes.

Two numbers are kept that the loop never reads by name. "health" wears down
after thirty-five, drops while an ailment is running, and multiplies how
easily a bad year can kill you. "money" is a level rather than a heap — it
is what you are living on, so it pulls towards what you are living on it
from, rises with years in the same job, falls when the works close, and
takes the hit when the currency is reformed. Below a certain point the pool
gains counting it again and the cheaper shop and loses the sea; above
another it gains having it done properly. Ailments arrive on their own
schedule, more often the older and the less well you are, and about a
seventh of lives end in one.


# The thinking

The mind used to be a list of about fifty sentences, drawn from at random.
Fifty sentences is not a mind: it comes round in a fortnight and after that
you are counting. A life now thinks two hundred or so different things,
because "memory.py" holds shapes rather than sentences, and the particulars
are the life's own — the people it actually met, the four things it actually
owes, the years it actually had, the joints that actually started to go and
the age they started.

    the way Marko says your name
    what you owe Marko, which is not money
    standing on the back step, doing nothing
    the afternoon the coat that still fits is finally done
    what you said at seventeen

Thoughts know the hour. Three in the morning is not nine in the morning:
what is available to think is the same, but what comes to hand at night
leans backward and unpleasant and what comes to hand in the morning leans
forward. Measured over a life it comes out at 42% forward in the morning
against 10% back, and 34% back at night against 22% forward.

A preoccupation is a subject and not a sentence, so for a few years at a
time more of what you think is about the same person, or the same unpaid
thing, and "related()" walks to the same subject before it walks to the same
theme. That is why the thoughts before one thing done tend to be a train
rather than a shuffle.

Four things about thinking have actually been measured, and this is what the
model does with them. Two are numbers and two are only directions; the
constants are in "world.py" and say which is which.

- Minds are somewhere else about 46.9% of waking moments — Killingsworth &
  Gilbert, Science 2010, 2,250 adults and about 250,000 samples. So a
  thought here does not stop the day: while you are up you are already doing
  something and the thought colours a stretch of it. Over fourteen lives the
  model averages 49%, and any one life runs from 32% to 68% — because worry
  multiplies the "restless" dial by 1.35 and patience by 0.80, so a patient
  person's mind wanders less, which is the point of having the dial at all.
  Lying down there is nothing alongside it, and then it costs the clock what
  it costs, which is why the night is long.
- About 6,200 thought transitions in a day — Tseng & Poppenk, Nature
  Communications 2020. This model records every thought it has and a life is
  29,000 days, so it does not go near that: it has about 100 a day, and a
  thought here is an episode rather than a transition.
- Wandering points forward more often than back. Direction measured; this
  comes out around thirteen ahead for every ten behind, which is on the low
  side of what is reported, and is not tuned to a figure — the shapes are
  written first and the ratio is whatever they give.
- Wandering is more often pleasant than unpleasant, and it declines with age
  (Jackson & Balota 2012; Maillet & Schacter 2016). Directions only. The
  pleasant shapes get one extra copy in the pool, and "restless" — the dial
  live.py:30 reads — is multiplied by a term falling from 1.15 to 0.75 over
  a life. That slope is invented, and the web version prints it in the
  working with everything else that leans on the dial.

The account at the end reports all of it, so the model can be checked
against the paper rather than believed.


# Frequently Asked Questions

Q: The code doesn't work.

A: It does now. This is not obviously an improvement.

Q: There was a typo in live.py, in the part about not falling asleep.

A: There was. It survived from the first commit in 2021 until it was fixed.
The line now counts the attempts you were counting, which is what it always
meant. It cost the file its most accurate line.

Q: "main.py" never sets "dead" to True.

A: It never has to.

Q: What is long division doing in there?

A: It comes out of "education.py", where it is one of the three things
arithmetic consists of, and one of the five things that survive school at
all. It used to go into the pool of things you can do, so a life would spend
forty-five minutes of a Tuesday afternoon on long division, which is not
what happens to long division. What school leaves you now divides in two:
things you go on doing, which are how to look busy and how to sit through
things, and things you go on only knowing, which sit there and are thought
about instead — whether you could still do it, that it has never once come
up, teaching it to someone.

Q: "understand()" raises NotImplementedError for most subjects.

A: Only for the ones you were assigned.

Q: Why do the questions never run out?

A: Every question asked produces two or three more. The loop ends when the
bell goes, and what is left is left. Check the last lines of the output.

Q: "grow_up()" doesn't terminate.

A: It does, eventually, on someone. Check the year it happens.

Q: The mother always gives you the worry.

A: She did, twice over. First because only she defined it. Then, once the
ancestor and the grandmother defined it too, because "class You(Mother, Father)"
put her first in the order and "inherit()" stops at the first it finds. The
bases are built per life now:

    bases = (Mother, Father) if random.randrange(2) == 0 else (Father, Mother)
    You = type('You', bases, {})

Both parents worry — she about everything, he about what people think — so
which of them you take after is the order of the bases, and the order is not
something you were asked about. "blame()" still walks it backwards and still
reaches the ancestor.

Q: What do the traits actually do?

A: They turn the dials the loop reads. "wind_up()" in world.py rebuilds six
numbers out of what you were given, what was done to you before you could
object, and what happens to be going on: worry takes 0.018 off the chance of
falling asleep and multiplies idle thinking by 1.35, patience gives some of it
back, hope multiplies the chance of the list coming into view by 1.6,
stubbornness slows how fast what you do drifts back. A war leans on the same
numbers while it lasts. Nothing is a label; every entry is read by a line of
live.py, and the web version prints the whole working.

Q: Where does the world get into the loop?

A: Through "things_you_can_do". "restock()" adds every active circumstance's
own activities to the pool that "live()" draws from, and "take_place()" is what
turns a war into a circumstance. In the web version, open the years after one:
the pool has changed and what you spend the day on has changed with it.

Q: Why does "inherit()" use a shallow copy?

A: Because a deep one was never available. You and your mother are still
pointing at the same object.

Q: I ran it and the list at the end was still long.

A: Yes.

Q: Why is "call your mother" not on the list any more?

A: Check the year your mother died. It is removed then, and it cannot be
added again.

Q: The war is not about anywhere.

A: No.

Q: Can I contribute?

A: You already are.
