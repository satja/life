import os
import random

seed = int(os.environ.get('LIFE_SEED', random.randrange(10 ** 7)))
random.seed(seed)
