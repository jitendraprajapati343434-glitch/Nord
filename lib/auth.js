// lib/auth.js
// Password hashing (scrypt, built into Node - no bcrypt dependency needed)
// and a tiny in-memory session store keyed by a random cookie value.

const crypto = require('crypto');

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}
function verifyPassword(password, salt, expectedHash) {
  const { hash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash));
}

// sessionId -> userId. In-memory: restarting the server logs everyone out.
// Fine for a prototype; persist to a file/DB if you need durability.
const sessions = new Map();

function createSession(userId) {
  const sessionId = crypto.randomBytes(24).toString('hex');
  sessions.set(sessionId, userId);
  return sessionId;
}
function getUserIdBySession(sessionId) {
  return sessions.get(sessionId);
}
function destroySession(sessionId) {
  sessions.delete(sessionId);
}

module.exports = {
  hashPassword,
  verifyPassword,
  createSession,
  getUserIdBySession,
  destroySession,
};
