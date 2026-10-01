grep ERROR access.log > errors.txt
grep ERROR access.log | wc -l > error-count.txt
cut -d' ' -f3 access.log | sort | uniq > users.txt
