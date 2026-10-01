---
title: Authentication and security
summary: Store passwords so that a leak does not expose them, issue tokens that cannot be forged, and close the common holes.
---

## Authentication and authorization

- **Authentication**: who are you? Proving an identity.
- **Authorization**: what may you do? Checked on every request, after authentication.

A bug in either is a security incident, so this is the part of a backend to write most carefully. For real products, use a maintained library or an identity service. You still need to understand what they do.

## Passwords

**Never store a password.** Store a **hash**: the output of a one-way function. At login, hash what was typed and compare.

A plain hash such as SHA-256 is not enough, for two reasons:

- It is **fast**. An attacker with your leaked database tries billions of guesses per second.
- The same password always gives the same hash. A precomputed table breaks every common password at once.

A **password hashing function** fixes both. It is deliberately slow, and it mixes in a random **salt**, different for every user. Node has `scrypt` built in:

```javascript
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;      // store salt and hash together
}

function verifyPassword(password, stored) {
  const [saltHex, hashHex] = stored.split(":");
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}
```

- The salt is not secret. It is stored next to the hash.
- `timingSafeEqual` compares without revealing, through timing, how many bytes matched. `===` on secrets leaks that.
- In a server use the asynchronous `scrypt`. The `Sync` version blocks the event loop for tens of milliseconds, on purpose.

Popular alternatives are `bcrypt` and `argon2`, available as npm packages.

## Tokens

After login the client must prove, on every request, that it logged in. One way is a **signed token**: a piece of data plus a signature that only the server can produce.

An **HMAC** combines a message with a secret key:

```javascript
import { createHmac } from "node:crypto";

function sign(text, secret) {
  return createHmac("sha256", secret).update(text).digest("base64url");
}
```

A token is then `payload.signature`:

```javascript
function createToken(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body, secret)}`;
}
```

To verify: compute the signature of the received body again and compare. If anyone changed one character of the payload, the signature no longer matches, and they cannot make a new one without the secret.

Three things to remember:

- The payload is **encoded, not encrypted**. Anyone can read it. Never put secrets in it.
- Give every token an **expiry**, and check it.
- The secret lives in an environment variable, is long and random, and is never in Git.

This is the idea behind **JWT** (JSON Web Tokens), the widely used standard. In production use a JWT library and do not write your own format. The exercise builds one so that you see there is no magic.

## Sessions or tokens

| | Session | Token |
| --- | --- | --- |
| The client holds | a random id, in a cookie | the signed data itself |
| The server holds | the session data, in Redis or a database | nothing |
| Logging out everywhere | delete the session | hard: the token is valid until it expires |
| Fits | web applications | APIs called by other services and mobile apps |

Sessions are simpler and safer for an ordinary web application. Tokens suit APIs. With tokens, keep the lifetime short.

## Middleware

```javascript
function requireAuth(req, res, next) {
  const header = req.get("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const payload = verifyToken(token, process.env.TOKEN_SECRET);
  if (!payload) {
    return res.status(401).json({ error: "not authenticated" });
  }
  req.user = payload;
  next();
}

app.get("/me", requireAuth, (req, res) => res.json({ id: req.user.sub }));
```

Authorization comes after it, in every handler that touches somebody's data:

```javascript
if (note.ownerId !== req.user.sub) {
  return res.status(404).json({ error: "not found" });
}
```

Forgetting that check is the most common serious bug in APIs: user 7 asks for `/notes/12`, which belongs to user 3, and gets it.

## A short security checklist

| Risk | Defence |
| --- | --- |
| password guessing | rate-limit the login route, [per address and per account](redis/05-transactions-pubsub-limits) |
| injection (SQL, shell) | parameters and prepared statements, never string building |
| cross-site scripting | escape output; `HttpOnly` cookies |
| leaked secrets | environment variables, never Git, rotate when in doubt |
| vulnerable packages | `npm audit`, few dependencies, a lock file |
| eavesdropping | HTTPS everywhere |
| verbose errors | generic messages to clients, details in logs |
| user enumeration | the same answer for "unknown user" and "wrong password" |

## Common mistakes

- **Storing passwords in plain text, or with MD5 or SHA-256.**
- **Comparing secrets with `===`.**
- **Tokens that never expire.**
- **A secret with a default value in the code**, such as `process.env.SECRET || "secret"`. Production then silently runs with "secret".
- **Checking that a user is logged in, and not that the data is theirs.**
- **Inventing your own cryptography.** Combine the standard building blocks, as this lesson does, and prefer a library.
