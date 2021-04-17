#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { encrypt, generateKey } = require("./encryption");
const envParse = require("./envParse");
const { log, logLevel } = require("./log");

const rootDir = process.cwd();
const encryptedEnvPath = path.resolve(rootDir, ".env-encrypted");
const unencryptedEnvPath = path.resolve(rootDir, ".env-unencrypted.env");

const shouldInit = process.argv.includes("--init");

let unencryptedEnv;
if (fs.existsSync(unencryptedEnvPath)) {
  if (shouldInit) {
    logLevel("error", `Cannot init, ${unencryptedEnvPath} already exists!`);
    process.exit(1);
  }

  unencryptedEnv = fs.readFileSync(unencryptedEnvPath, "utf8");
} else {
  if (!shouldInit) {
    logLevel(
      "error",
      `No ${unencryptedEnvPath} exists! Run this command with '--init' if you're trying to initialise the repo`
    );
    process.exit(1);
  }

  log(`Creating an unencrypted .env file at ${unencryptedEnvPath}`);
  const secretKey = generateKey();
  unencryptedEnv = envParse.stringify(
    {
      __base: "SHARED_VAR=shared",
      Development: "MY_VAR=1",
      Production: "MY_VAR=2",
      MySpecialGroup: "MY_VAR=3",
    },
    secretKey
  );
  fs.writeFileSync(unencryptedEnvPath, unencryptedEnv);
}
const { env: unencryptedParsedEnv, secretKey } = envParse.parse(unencryptedEnv);

fs.writeFileSync(
  encryptedEnvPath,
  encrypt(secretKey, envParse.stringify(unencryptedParsedEnv, { __omit: true }))
);

if (shouldInit) {
  log(
    "\n\n" +
      `
Your repo has been initialised! 🥳
Great work. You have a couple more things to do:

1. Make sure your \`.env-encrypted\` file is not in your .gitignore
2. Make sure your \`.env-unencrypted.env\` file **IS** in your .gitignore (**DO NOT COMMIT THIS FILE!**)
3. Share the following snippet with your team via. 1Password, or LastPass, etc.

#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
#~~     Put me in a file called .env-unencrypted.env     ~~#
#~~ Make sure to not commit this file to source control! ~~#
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
#~~ secretKey::::${secretKey}
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
`.trim() +
      "\n\n"
  );
}
