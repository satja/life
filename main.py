import genes
import upbringing
import education
from live import wake_up, live, sleep

if __name__ == "__main__":
    dead = False
    while not dead:
        wake_up()
        live()
        sleep()
