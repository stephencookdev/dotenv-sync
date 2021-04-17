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

let unencryptedEnv;
if (fs.existsSync(unencryptedEnvJsonPath)) {
  unencryptedEnv = fs.readFileSync(unencryptedEnvJsonPath, "utf8");
} else {
  console.log("No .unencrypted.env exists! Creating one now...");
  unencryptedEnv = envParse.stringify({
    Local: "EXAMPLE=1",
    Development: "EXAMPLE=2",
  });
  fs.writeFileSync(unencryptedEnvJsonPath, unencryptedEnv);
}
const unencryptedEnvJson = envParse.parse(unencryptedEnv);

fs.writeFileSync(
  encryptedEnvJsonPath,
  encrypt(secretKey, envParse.stringify(unencryptedEnvJson))
);
