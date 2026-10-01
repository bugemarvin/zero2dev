# A rolling deployment

Write `rolling_deploy(servers, new_version, healthy, batch_size)` in `solution.py`.

- `servers` is a list of dictionaries such as `{"name": "web-1", "version": "1.4.0"}`. The function **changes** the `version` of these dictionaries, as a deployment changes real servers.
- `healthy(server)` is a function that returns `True` or `False` for a server.
- Servers are updated in batches of `batch_size`, in the order of the list.

For each batch:

1. Set the `version` of every server in the batch to `new_version`. A server that already has the new version is skipped: it is not updated and not checked.
2. Then check each updated server of the batch with `healthy`, in order.
3. If one is not healthy, **roll back**: every server updated so far, in this batch and earlier ones, gets its old version back. Stop, and return:

```python
{"status": "rolled_back", "failed": "web-3", "updated": []}
```

`failed` is the name of the first unhealthy server.

When all batches succeed, return:

```python
{"status": "done", "failed": None, "updated": ["web-1", "web-2", "web-3"]}
```

`updated` lists the names of the servers that were changed, in order. A `batch_size` below 1 raises `ValueError`.
