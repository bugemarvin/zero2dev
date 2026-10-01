// Tests. Do not edit. Run them yourself with: node --test
import test from "node:test";
import assert from "node:assert/strict";
import { createHmac, scryptSync } from "node:crypto";
import { hashPassword, verifyPassword, createToken, verifyToken } from "./solution.mjs";

test("hashPassword returns SALT:HASH in hex", () => {
  const stored = hashPassword("correct horse");
  assert.match(stored, /^[0-9a-f]{32}:[0-9a-f]{128}$/);
});

test("the hash is scrypt of the password with that salt", () => {
  const [salt, hash] = hashPassword("correct horse").split(":");
  assert.equal(scryptSync("correct horse", Buffer.from(salt, "hex"), 64).toString("hex"), hash);
});

test("the same password gives a different result each time", () => {
  assert.notEqual(hashPassword("same"), hashPassword("same"));
});

test("the password itself is not in the stored string", () => {
  assert.ok(!hashPassword("hunter2").includes("hunter2"));
});

test("verifyPassword accepts the right password and refuses a wrong one", () => {
  const stored = hashPassword("correct horse");
  assert.equal(verifyPassword("correct horse", stored), true);
  assert.equal(verifyPassword("wrong horse", stored), false);
  assert.equal(verifyPassword("", stored), false);
});

test("verifyPassword returns false for a malformed stored string", () => {
  assert.equal(verifyPassword("x", ""), false);
  assert.equal(verifyPassword("x", "no-colon"), false);
  assert.equal(verifyPassword("x", "zz:zz"), false);
});

test("a token is BODY.SIGNATURE with an exp field", () => {
  const token = createToken({ sub: 7, role: "admin" }, "s3cret", 1000, 60);
  const [body, signature, extra] = token.split(".");
  assert.equal(extra, undefined);
  assert.deepEqual(JSON.parse(Buffer.from(body, "base64url").toString()), { sub: 7, role: "admin", exp: 1060 });
  assert.equal(signature, createHmac("sha256", "s3cret").update(body).digest("base64url"));
});

test("createToken does not change the payload it was given", () => {
  const payload = { sub: 1 };
  createToken(payload, "k", 0, 10);
  assert.deepEqual(payload, { sub: 1 });
});

test("verifyToken returns the payload of a valid token", () => {
  const token = createToken({ sub: 7 }, "s3cret", 1000, 60);
  assert.deepEqual(verifyToken(token, "s3cret", 1030), { sub: 7, exp: 1060 });
});

test("an expired token is refused", () => {
  const token = createToken({ sub: 7 }, "s3cret", 1000, 60);
  assert.equal(verifyToken(token, "s3cret", 1060), null);
  assert.equal(verifyToken(token, "s3cret", 5000), null);
});

test("a token signed with another secret is refused", () => {
  assert.equal(verifyToken(createToken({ sub: 7 }, "other", 1000, 60), "s3cret", 1001), null);
});

test("a token whose body was changed is refused", () => {
  const token = createToken({ sub: 7, role: "user" }, "s3cret", 1000, 60);
  const forged = Buffer.from(JSON.stringify({ sub: 7, role: "admin", exp: 9999999999 })).toString("base64url");
  assert.equal(verifyToken(`${forged}.${token.split(".")[1]}`, "s3cret", 1001), null);
});

test("text that is not a token gives null, not an exception", () => {
  for (const junk of ["", "abc", "a.b.c", ".", "###.###", null, undefined]) {
    assert.equal(verifyToken(junk, "s3cret", 0), null);
  }
});
