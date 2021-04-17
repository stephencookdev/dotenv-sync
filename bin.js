#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { encrypt, decrypt, generateKey } = require("./encryption");
const envParse = require("./envParse");
const { log, logLevel } = require("./log");

const rootDir = process.cwd();
const encryptedEnvPath = path.resolve(rootDir, ".env-encrypted");
const unencryptedEnvPath = path.resolve(rootDir, ".env-unencrypted.env");

const shouldInit = process.argv.includes("--init");
const shouldPull = process.argv.includes("--pull");

if (shouldInit && shouldPull) {
  logLevel("error", "Cannot init and pull");
  process.exit(1);
}

let unencryptedRawEnv;
if (fs.existsSync(unencryptedEnvPath)) {
  if (shouldInit) {
    logLevel("error", `Cannot init, ${unencryptedEnvPath} already exists!`);
    process.exit(1);
  }

  unencryptedRawEnv = fs.readFileSync(unencryptedEnvPath, "utf8");
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
  unencryptedRawEnv = envParse.stringify(
    {
      __base: "SHARED_VAR=shared",
      Development: "MY_VAR=1",
      Production: "MY_VAR=2",
      MySpecialGroup: "MY_VAR=3",
    },
    secretKey
  );
  fs.writeFileSync(unencryptedEnvPath, unencryptedRawEnv);
}
const { env: possibleUnencryptedEnv, secretKey } = envParse.parse(
  unencryptedRawEnv
);

let unencryptedEnv = possibleUnencryptedEnv;
if (shouldPull) {
  unencryptedEnv = envParse.parse(
    decrypt(secretKey, fs.readFileSync(encryptedEnvPath, "utf8"))
  ).env;

  const newEncryptedFile = envParse.stringify(unencryptedEnv, secretKey);
  fs.writeFileSync(unencryptedEnvPath, newEncryptedFile);
} else {
  fs.writeFileSync(
    encryptedEnvPath,
    encrypt(secretKey, envParse.stringify(unencryptedEnv, { __omit: true }))
  );
}

if (shouldInit) {
  log(
    `
Your repo has been initialised! 🥳
Great work. You have a couple more things to do:

1. Make sure your \`.env-encrypted\` file is not in your
   .gitignore
2. Make sure your \`.env-unencrypted.env\` file **IS** in
   your .gitignore (**DO NOT COMMIT THIS FILE!**)
3. Share the following snippet with your team via.
   1Password, or LastPass, etc.

#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
#~~     Put me in a file called .env-unencrypted.env     ~~#
#~~       and call \`$(npm bin)/dotenv-sync\` --pull       ~~#
#~~ Make sure to not commit this file to source control! ~~#
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
#~~ secretKey::::${secretKey}
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
`.trim() + "\n\n"
  );
}

if (shouldPull) {
  const groups = Object.keys(unencryptedEnv).filter((g) => g !== "__base");
  const exampleGroupTarget = groups[0];

  log(
    `
All done, you're ready to go! Great work 🥳

Check out the new generated \`.env-unencrypted.env\` file,
your team may have left some comments, or an example .env

${
  exampleGroupTarget
    ? `
Your \`.env-unencrypted.env\` is split into groups. You
could, for example, add the following to your .env file:
\`\`\`
_ENV_GROUP_TARGET=${exampleGroupTarget}
\`\`\`
to use all of the ENV vars in the "${exampleGroupTarget}" group
`.trim()
    : ""
}`.trim()
  );
}
