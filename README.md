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

A life is the years something happened in; the rest were lived, and that is
all there is to say about them. Open a year and you get its months, a month
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


# Frequently Asked Questions

Q: The code doesn't work.

A: It does now. This is not obviously an improvement.

Q: There was a typo in live.py, in the part about not falling asleep.

A: There was. It survived from the first commit in 2021 until it was fixed.
The line now counts the attempts you were counting, which is what it always
meant. It cost the file its most accurate line.

Q: "main.py" never sets "dead" to True.

A: It never has to.

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
turns a war into a circumstance. Click the name in the web version and the
three of them unfold in order.

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
