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

There is also a web version in "web/", and its subject is this file. It shows
"live.py" and runs it, and puts in the margin how often each line ran and how
often it was true — so the thing the poem is about is stated by the poem:

    if len(things_you_should_do) > 0:         229,240x   true 22
        if random.randrange(3) == 0:               22x   true  9
            do(thing_to_do)                         9x

    if len(things_you_should_never_do) > 0:   229,240x   true 16,888
        if random.randrange(4) == 0:           16,888x   true 4,149
            do(thing_to_do)                     4,149x

Click any name and its definition unfolds where it stands, read out of the
file it lives in. A line with no count never ran, which is worth seeing: two
of them never do. There is also a walk through a single day, line by line,
with the values in the margin.

Nothing on the page is retyped. "web/extract.py" reads the real modules at
build time, so the listing and the source cannot drift apart. The commentary
is Croatian and English; the program and everything it says stay in the
language it was written in.

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

A: She did. Only she defined it, so there was nothing for the order to decide.
Three of them define it now — the ancestor worries about the winter, the
grandmother about money, the mother about everything — so "inherit()" stops at
the nearest and "blame()" reaches the furthest, and they disagree. That is what
the diamond was for.

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
