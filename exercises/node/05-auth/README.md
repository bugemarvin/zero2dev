# Password hashing and signed tokens

Write four functions in `solution.mjs`, using only `node:crypto`.

## Passwords

- `hashPassword(password)` returns a string `SALT:HASH`, both in hex. The salt is 16 random bytes, and the hash is `scryptSync(password, salt, 64)`. Two calls with the same password give different results.
- `verifyPassword(password, stored)` returns `true` when the password matches the stored string. Compare with `timingSafeEqual`. A stored string that is not in the right form gives `false`, not an exception.

## Tokens

A token is `BODY.SIGNATURE`:

- `BODY` is the JSON of the payload, encoded as `base64url`.
- `SIGNATURE` is the HMAC-SHA256 of `BODY` with the secret, as `base64url`.

Write:

- `createToken(payload, secret, now, lifetime)` adds the field `exp` to a copy of the payload: `now + lifetime` (both in seconds), and returns the token.
- `verifyToken(token, secret, now)` returns the payload when the signature is right and `exp` is later than `now`. In every other case it returns `null`: a wrong signature, a changed body, an expired token, or text that is not a token at all. It never throws.
