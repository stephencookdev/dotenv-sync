#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { encrypt, generateKey } = require("./encryption");
const envParse = require("./envParse");

const rootDir = process.cwd();
const secretKeyPath = path.resolve(rootDir, ".secretKey.env");
const encryptedEnvJsonPath = path.resolve(rootDir, ".encrypted.env");
const unencryptedEnvJsonPath = path.resolve(rootDir, ".unencrypted.env");

let secretKey;
if (fs.existsSync(secretKeyPath)) {
  secretKey = fs.readFileSync(secretKeyPath, "utf8");
} else {
  console.log("No secret key exists! Creating one now...");
  secretKey = generateKey();
  fs.writeFileSync(secretKeyPath, secretKey);
}

const unencryptedEnvJson = envParse.parse(
  fs.readFileSync(unencryptedEnvJsonPath, "utf8")
);

fs.writeFileSync(
  encryptedEnvJsonPath,
  encrypt(secretKey, envParse.stringify(unencryptedEnvJson, null, 2))
);
