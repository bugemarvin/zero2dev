#!/usr/bin/env python3
"""zero2dev exercise checker. Run `python3 check.py help` for the commands.

The engine lives in the z2d/ package. This file is the terminal entry point,
and it re-exports the names that tools/selftest.py and other scripts use.
"""
import sys

from z2d import cli
from z2d.core import Exercise, Result, Skip, load_exercises, run  # noqa: F401
from z2d.progress import load_progress, save_progress  # noqa: F401
from z2d.runner import (PostgresDb, SqliteDb, run_checks, setup_sandbox,  # noqa: F401
                        split_sql)
from z2d.toolchains import LANGS  # noqa: F401

if __name__ == "__main__":
    try:
        sys.exit(cli.main(sys.argv[1:]))
    except KeyboardInterrupt:
        sys.exit(130)
