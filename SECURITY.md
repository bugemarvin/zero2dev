# Security

The zero2dev app runs code on the learner's own computer. That is its purpose, and it is also why its security matters.

## What the app promises

- The server listens on `127.0.0.1` only. Other computers cannot reach it.
- It refuses requests whose `Host` is not its own, and requests from other websites.
- Every API call needs a token that only the app's own pages, or a website the learner approved on that computer, can read.
- A website is never approved by default, and never by the website itself.
- The app does not send the learner's code, progress or any other data anywhere.
- Installing tools never asks for a password in a web page.

A way to break any of these is a vulnerability. So is an exercise, lesson or script in this repository that harms the machine of someone who uses it as intended.

## Reporting a vulnerability

Please do **not** open a public issue. Use GitHub's private reporting: on the repository page, **Security**, then **Report a vulnerability**. If that is not available to you, contact [@bugemarvin](https://github.com/bugemarvin) privately through GitHub.

Say what you found, how to reproduce it, and what an attacker could do with it. You will get an answer, and credit in the fix if you want it.

## What is not a vulnerability

- A learner's own code doing damage on their own machine. The app runs what the learner writes.
- A website that the learner approved running code. That is what approving means, and the approval page says so.
- Problems that need the attacker to already control the learner's account on that computer.

## For contributors

Changes to `z2d/server.py`, `z2d/api.py`, `z2d/origins.py` and anything that runs a command get a careful review. `tools/test_app.py` holds the security checks: add a check for every rule you add or change, and never weaken one to make a test pass.
