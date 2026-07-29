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

There is also a web version in "web/", which runs the same model in a browser
at one year per second, with settings for the century you were born into and
for how often you remember the list. Build it with "python3 web/build.py" and
open "web/life.html".

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
