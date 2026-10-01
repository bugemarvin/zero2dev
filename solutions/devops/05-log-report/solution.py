import math
import sys

times = []
errors = 0
for line in sys.stdin:
    fields = line.split()
    if not fields:
        continue
    if int(fields[2]) >= 500:
        errors += 1
    times.append(int(fields[3]))

n = len(times)
print(f"requests: {n}")
if n:
    times.sort()
    print(f"errors: {errors}")
    print(f"error rate: {100 * errors / n:.1f}%")
    for p in (50, 95):
        print(f"p{p}: {times[math.ceil(p / 100 * n) - 1]}")
