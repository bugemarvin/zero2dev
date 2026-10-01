from solution import rolling_deploy


def fleet(*versions):
    return [{"name": f"web-{i}", "version": v} for i, v in enumerate(versions, 1)]


def versions(servers):
    return [s["version"] for s in servers]


def test_all_healthy():
    """every server is updated when all checks pass"""
    servers = fleet("1.0", "1.0", "1.0", "1.0", "1.0")
    result = rolling_deploy(servers, "2.0", lambda s: True, 2)
    assert result == {"status": "done", "failed": None, "updated": ["web-1", "web-2", "web-3", "web-4", "web-5"]}, result
    assert versions(servers) == ["2.0"] * 5


def test_batches():
    """servers are updated batch by batch, and checked after their batch is updated"""
    servers = fleet("1.0", "1.0", "1.0", "1.0", "1.0")
    seen = []

    def healthy(server):
        seen.append((server["name"], tuple(versions(servers))))
        return True

    rolling_deploy(servers, "2.0", healthy, 2)
    assert seen == [
        ("web-1", ("2.0", "2.0", "1.0", "1.0", "1.0")),
        ("web-2", ("2.0", "2.0", "1.0", "1.0", "1.0")),
        ("web-3", ("2.0", "2.0", "2.0", "2.0", "1.0")),
        ("web-4", ("2.0", "2.0", "2.0", "2.0", "1.0")),
        ("web-5", ("2.0", "2.0", "2.0", "2.0", "2.0")),
    ], seen


def test_rollback_in_first_batch():
    """a failure in the first batch restores it and touches nothing else"""
    servers = fleet("1.0", "1.0", "1.0", "1.0")
    result = rolling_deploy(servers, "2.0", lambda s: s["name"] != "web-2", 2)
    assert result == {"status": "rolled_back", "failed": "web-2", "updated": []}, result
    assert versions(servers) == ["1.0"] * 4


def test_rollback_restores_earlier_batches():
    """a failure in a later batch restores every server updated so far"""
    servers = fleet("1.0", "1.1", "1.0", "1.2", "1.0", "1.0")
    checked = []

    def healthy(server):
        checked.append(server["name"])
        return server["name"] != "web-4"

    result = rolling_deploy(servers, "2.0", healthy, 2)
    assert result == {"status": "rolled_back", "failed": "web-4", "updated": []}, result
    assert versions(servers) == ["1.0", "1.1", "1.0", "1.2", "1.0", "1.0"], "each server must get its own old version back"
    assert checked == ["web-1", "web-2", "web-3", "web-4"], f"checked: {checked}. Stop at the first unhealthy server."


def test_skips_servers_already_on_the_new_version():
    """servers already on the new version are not updated, checked or listed"""
    servers = fleet("2.0", "1.0", "2.0", "1.0")
    checked = []
    result = rolling_deploy(servers, "2.0", lambda s: checked.append(s["name"]) or True, 2)
    assert result == {"status": "done", "failed": None, "updated": ["web-2", "web-4"]}, result
    assert checked == ["web-2", "web-4"], checked


def test_skipped_servers_survive_a_rollback():
    """a rollback does not touch servers that were already on the new version"""
    servers = fleet("2.0", "1.0", "1.0")
    result = rolling_deploy(servers, "2.0", lambda s: s["name"] != "web-3", 1)
    assert result["status"] == "rolled_back" and result["failed"] == "web-3", result
    assert versions(servers) == ["2.0", "1.0", "1.0"]


def test_batch_size_one_and_large():
    """a batch size of 1 and one larger than the fleet both work"""
    servers = fleet("1.0", "1.0", "1.0")
    assert rolling_deploy(servers, "2.0", lambda s: True, 1)["status"] == "done"
    servers = fleet("1.0", "1.0", "1.0")
    assert rolling_deploy(servers, "2.0", lambda s: True, 50)["updated"] == ["web-1", "web-2", "web-3"]


def test_empty_and_invalid():
    """no servers is fine, and a batch size below 1 is refused"""
    assert rolling_deploy([], "2.0", lambda s: True, 2) == {"status": "done", "failed": None, "updated": []}
    try:
        rolling_deploy(fleet("1.0"), "2.0", lambda s: True, 0)
    except ValueError:
        pass
    else:
        raise AssertionError("a batch size of 0 should raise ValueError")
