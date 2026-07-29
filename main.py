import genes
import upbringing
import education
from world import dead
from live import wake_up, live, sleep

if __name__ == "__main__":
    while not dead:
        wake_up()
        live()
        sleep()
