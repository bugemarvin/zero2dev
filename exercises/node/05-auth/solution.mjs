import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPassword(password) {
  return "";
}

export function verifyPassword(password, stored) {
  return false;
}

export function createToken(payload, secret, now, lifetime) {
  return "";
}

export function verifyToken(token, secret, now) {
  return null;
}
