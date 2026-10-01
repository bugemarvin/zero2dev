# A latency report

Read an access log from standard input. Each line has four fields separated by spaces:

```text
GET /home 200 120
POST /login 500 950
```

They are the method, the path, the status code and the response time in milliseconds. Blank lines are ignored.

Print a report of five lines:

```text
requests: 10
errors: 2
error rate: 20.0%
p50: 30
p95: 400
```

- `errors` counts the lines whose status is 500 or more.
- `error rate` is the errors as a percentage of the requests, with one decimal.
- `p50` and `p95` are percentiles of the response times by the **nearest-rank** method: sort the times, and take the value at position `ceil(p / 100 * n)`, counting from 1.

With no requests, print `requests: 0` and nothing else.
