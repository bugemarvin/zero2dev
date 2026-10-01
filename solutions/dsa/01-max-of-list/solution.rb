tokens = STDIN.read.split.map(&:to_i)
n = tokens[0]
puts tokens[1, n].max
