#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { encrypt, generateKey } = require("./encryption");

const rootDir = process.cwd();
const secretKeyPath = path.resolve(rootDir, ".env-secretKey");
const encryptedEnvJsonPath = path.resolve(rootDir, ".env-encrypted");
const unencryptedEnvJsonPath = path.resolve(rootDir, ".env-unencrypted.json");

let secretKey;
if (fs.existsSync(secretKeyPath)) {
  secretKey = fs.readFileSync(secretKeyPath, "utf8");
} else {
  console.log("No secret key exists! Creating one now...");
  secretKey = generateKey();
  fs.writeFileSync(secretKeyPath, secretKey);
}

const unencryptedEnvJson = JSON.parse(
  fs.readFileSync(unencryptedEnvJsonPath, "utf8")
);

fs.writeFileSync(
  encryptedEnvJsonPath,
  encrypt(secretKey, JSON.stringify(unencryptedEnvJson, null, 2))
);
