def rolling_deploy(servers, new_version, healthy, batch_size):
    for server in servers:
        server["version"] = new_version
    return {"status": "done", "failed": None, "updated": [s["name"] for s in servers]}
