import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password, stored) {
  const parts = String(stored).split(":");
  if (parts.length !== 2 || !/^[0-9a-f]{32}$/.test(parts[0]) || !/^[0-9a-f]{128}$/.test(parts[1])) {
    return false;
  }
  const expected = Buffer.from(parts[1], "hex");
  const actual = scryptSync(password, Buffer.from(parts[0], "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

function sign(body, secret) {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

export function createToken(payload, secret, now, lifetime) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: now + lifetime })).toString("base64url");
  return `${body}.${sign(body, secret)}`;
}

export function verifyToken(token, secret, now) {
  const parts = String(token).split(".");
  if (parts.length !== 2) {
    return null;
  }
  const [body, signature] = parts;
  const expected = Buffer.from(sign(body, secret));
  const given = Buffer.from(signature);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return typeof payload.exp === "number" && payload.exp > now ? payload : null;
  } catch {
    return null;
  }
}
