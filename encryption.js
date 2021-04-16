const crypto = require("crypto");

const CIPHER = "aes-256-cbc";
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(secretKey, text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv(CIPHER, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(secretKey, text) {
  let textParts = text.split(":");
  let iv = Buffer.from(textParts.shift(), "hex");
  let encryptedText = Buffer.from(textParts.join(":"), "hex");
  let decipher = crypto.createDecipheriv(CIPHER, Buffer.from(secretKey), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

function generateKey() {
  // Must be 256 bits (32 characters)
  return crypto.randomBytes(256 / 16).toString("hex");
}

module.exports = { decrypt, encrypt, generateKey };
