# A salary report

Write `report.sh`. It reads staff records from standard input, one per line, in the form `name,department,salary`:

```text
ada,engineering,5200
linus,engineering,4800
grace,research,6100
```

It prints one line per department, in alphabetical order, with the total salary and the number of people. Then a last line names the person with the highest salary:

```console
$ bash report.sh < staff.csv
engineering 10000 2
research 6100 1
highest: grace 6100
```

If the input is empty, print only `highest: none`.

`awk` does the grouping in one line. `sort` puts the departments in order.
