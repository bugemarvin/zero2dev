#!/usr/bin/env python3
"""zero2dev: the local learning app.

    python3 app.py                  start the app and open it in your browser
    python3 app.py --no-browser     start it without opening a browser
    python3 app.py --port 5000      use another port

    python3 app.py start            run it in the background, always on the same port
    python3 app.py stop             stop the background app
    python3 app.py status           is it running, and where?
    python3 app.py autostart off    do not start it automatically when you log in (on, status)
    python3 app.py --no-autostart   start it this once, and leave start-at-login alone

The first ordinary start switches start-at-login on, and says so. `autostart off` undoes it for good.

    python3 app.py trust URL        let a website (the guide hosted online) use this app: untrust, trusted
    python3 app.py prefetch react   download packages or images in advance (for offline use)

The app runs on this computer only (127.0.0.1) and uses the tools installed here.
Standard library only.
"""
import sys

from z2d import background, cli, origins, platforminfo, server


def port_from(argv):
    if "--port" not in argv:
        return background.DEFAULT_PORT
    try:
        return int(argv[argv.index("--port") + 1])
    except (IndexError, ValueError):
        sys.exit("--port needs a number, for example: --port 5000")


def main(argv):
    if argv and argv[0] in ("-h", "--help", "help"):
        print(__doc__.strip())
        return 0
    command = argv[0] if argv and not argv[0].startswith("-") else None
    port = port_from(argv)
    browser = "--no-browser" not in argv
    if command == "prefetch":
        return cli.cmd_prefetch(argv[1:])
    if command == "start":
        if "--no-autostart" not in argv:
            notice = background.first_run_enable(port)
            if notice:
                print(notice)
                if browser:
                    platforminfo.open_url(background.url(port))
                return 0
        return background.start(port, open_browser=browser)
    if command == "stop":
        return background.stop()
    if command == "status":
        now = background.status()
        print(f"zero2dev is running at {now['url']}" if now["running"] else "zero2dev is not running.")
        auto = background.autostart_status()
        if auto["supported"]:
            print("Start at login: " + ("on" if auto["enabled"] else "off"))
        return 0 if now["running"] else 1
    if command == "autostart":
        return background.command(argv[1:])
    if command in ("trust", "untrust"):
        if len(argv) < 2:
            sys.exit(f"Usage: python3 app.py {command} https://your-site.vercel.app")
        if command == "trust":
            added = origins.add(argv[1])
            if added is None:
                sys.exit("That is not a website address this app can approve. It must look like https://example.com")
            print(f"{added} may now use this app. A page from it can run code on this computer, "
                  f"so approve only sites you trust. Undo with: python3 app.py untrust {added}")
        else:
            print("Removed." if origins.remove(argv[1]) else "That website was not approved.")
        return 0
    if command == "trusted":
        approved = origins.trusted()
        print("\n".join(approved) if approved else "No website is approved. The app answers only its own pages.")
        return 0
    if command is not None:
        sys.exit(f"unknown command: {command}. See: python3 app.py --help")

    # Already running in the background? Then there is nothing to start: show it.
    if "--exact-port" not in argv and background.answers(port, 0.6):
        address = background.url(port)
        print(f"zero2dev is already running at {address}")
        if browser:
            platforminfo.open_url(address)
        return 0
    if "--exact-port" not in argv and "--no-autostart" not in argv:
        notice = background.first_run_enable(port)
        if notice:
            print(notice)
            if browser:
                platforminfo.open_url(background.url(port))
            return 0
    return server.serve(port=port, open_browser=browser, exact="--exact-port" in argv)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
