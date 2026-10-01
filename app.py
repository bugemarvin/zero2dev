#!/usr/bin/env python3
"""zero2dev: the local learning app.

    python3 app.py                  start the app and open it in your browser
    python3 app.py --no-browser     start it without opening a browser
    python3 app.py --port 5000      use another port
    python3 app.py prefetch react   download packages or images in advance (for offline use)

The app runs on this computer only (127.0.0.1) and uses the tools installed here.
Standard library only.
"""
import sys

from z2d import cli, server


def main(argv):
    if argv and argv[0] in ("-h", "--help", "help"):
        print(__doc__.strip())
        return 0
    if argv and argv[0] == "prefetch":
        return cli.cmd_prefetch(argv[1:])
    port = 4750
    if "--port" in argv:
        i = argv.index("--port")
        try:
            port = int(argv[i + 1])
        except (IndexError, ValueError):
            sys.exit("--port needs a number, for example: --port 5000")
    return server.serve(port=port, open_browser="--no-browser" not in argv)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
