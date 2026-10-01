"""Long tasks started from the web app (downloads, installs), with a log the page can poll."""
import threading
import uuid

_jobs = {}
_lock = threading.Lock()


class Job:
    def __init__(self, title):
        self.id = uuid.uuid4().hex[:12]
        self.title = title
        self.state = "running"
        self.lines = []

    def log(self, text):
        for line in str(text).split("\n"):
            if line.strip():
                self.lines.append(line.rstrip())
        del self.lines[:-400]

    def as_dict(self):
        return {"id": self.id, "title": self.title, "state": self.state, "log": "\n".join(self.lines[-80:])}


def start(title, work):
    """Run work(job) in a thread. It returns True for success; an exception or False means failure."""
    job = Job(title)
    with _lock:
        _jobs[job.id] = job

    def target():
        try:
            job.state = "done" if work(job) is not False else "failed"
        except Exception as exc:  # the page must see the reason, whatever it was
            job.log(f"{type(exc).__name__}: {exc}")
            job.state = "failed"

    threading.Thread(target=target, daemon=True).start()
    return job


def get(job_id):
    with _lock:
        return _jobs.get(job_id)


def recent(limit=12):
    """The newest jobs, running ones first, for the page that shows what the machine is doing."""
    with _lock:
        jobs = list(_jobs.values())
    jobs.reverse()
    jobs.sort(key=lambda job: job.state != "running")
    return jobs[:limit]
