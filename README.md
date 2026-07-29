# Life

A Pythonic description of life.
Start with "main.py" and see what's there.

It runs now.

    $ python3 main.py

It prints one life, from the first morning to the last, and then what it
came to. Every run is a different life. To live the same one twice:

    $ LIFE_SEED=33 python3 main.py

Feel free to contribute.


# Modules

"fate.py" — the seed. Imported first by everything, which is the point.

"genes.py" — what you got. Multiple inheritance, resolved in the usual order.

"upbringing.py" — what was done about it.

"education.py" — what was done instead.

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

"genes", "upbringing" and "education" do their work at import time, before the
loop starts. This is not a workaround.


# Frequently Asked Questions

Q: The code doesn't work.

A: It does now. This is not obviously an improvement.

Q: There is a typo in live.py, in the part about not falling asleep.

A: Yes. It has been there since the first commit, and it still runs, because
"attemtps" is defined: it is the number of attempts as counted by the world,
rather than the number you were counting. It is always the same number. It is
the most accurate line in the file.

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

Q: Can I contribute?

A: You already are.
