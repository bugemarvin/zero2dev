def rolling_deploy(servers, new_version, healthy, batch_size):
    if batch_size < 1:
        raise ValueError("batch_size must be at least 1")
    previous = {}       # name -> old version, for every server updated so far
    updated = []
    for start in range(0, len(servers), batch_size):
        batch = [s for s in servers[start:start + batch_size] if s["version"] != new_version]
        for server in batch:
            previous[server["name"]] = server["version"]
            server["version"] = new_version
            updated.append(server)
        for server in batch:
            if not healthy(server):
                for done in updated:
                    done["version"] = previous[done["name"]]
                return {"status": "rolled_back", "failed": server["name"], "updated": []}
    return {"status": "done", "failed": None, "updated": [s["name"] for s in updated]}
