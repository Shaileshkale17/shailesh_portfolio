import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

/**
 * Symmetric encrypt/decrypt helpers used to store third-party API
 * credentials (see `models/LinkedProject.js` -> `apiKey`) without keeping
 * them in plaintext in the database.
 *
 * Requires a 32-byte key in `ENCRYPTION_KEY` (base64-encoded). Generate one
 * with: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
 */
const getKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error("ENCRYPTION_KEY is not configured — cannot encrypt/decrypt stored credentials");
  const buf = Buffer.from(key, "base64");
  if (buf.length !== 32) throw new Error("ENCRYPTION_KEY must decode to exactly 32 bytes");
  return buf;
};

/**
 * Encrypts a plaintext string.
 * @param {string} plaintext
 * @returns {string} `iv:authTag:ciphertext`, each segment base64-encoded.
 */
export const encrypt = (plaintext) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, ciphertext].map((buf) => buf.toString("base64")).join(":");
};

/**
 * Decrypts a string produced by `encrypt`.
 * @param {string} payload
 * @returns {string} The original plaintext.
 */
export const decrypt = (payload) => {
  const [ivB64, authTagB64, ciphertextB64] = payload.split(":");
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertextB64, "base64")), decipher.final()]).toString("utf8");
};
