import sys

for line in sys.stdin:
    fields = line.split()
    # fields is [method, path, status, milliseconds], or empty for a blank line
