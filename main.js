const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { decrypt } = require("./encryption");
const envParse = require("./envParse");
const { log, logLevel } = require("./log");

const envFileUpdateNotice = `
🔐 .env-encrypted update detected

############################################################
# We are overwriting your local .env-unencrypted.env file  #
#          with the new value from .env-encrypted          #
#                                                          #
#  If you were trying to update the .env-unencrypted.env   #
#   then make sure to run \`$(npm bin)/dotenv-sync\` after   #
#       a change, so it can be shared with your team       #
############################################################
We are overwriting your local .env-unencrypted.env with the new value
`.trim();

const missingFilesNotice = `
If you are just trying to use this workspace, then you need
to copy a .env-unencrypted.env file. This will let you use
secret ENV vars, safely shared with your team.
Ask a teammate to help you get set up with the file!

If you are trying to add dotenv-sync to this workspace, then
you need to run \`$(npm bin)/dotenv-sync --init\`
`.trim();

const setProcessVars = (config, debug) => {
  Object.keys(config).forEach(function (key) {
    if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
      process.env[key] = config[key];
    } else if (debug) {
      log(
        `"${key}" is already defined in \`process.env\` and will not be overwritten`,
        { debug: true }
      );
    }
  });
};

const enforceFilesExists = (files) => {
  const missingFiles = files.filter((f) => !fs.existsSync(f));

  if (missingFiles.length) {
    logLevel(
      "error",
      `Missing the following required files:\n${missingFiles
        .map((f) => ` - ${f}`)
        .join("\n")}\n\n` + missingFilesNotice
    );
    process.exit(1);
  }
};

const config = ({ encoding = "utf8", debug = false } = {}) => {
  const rootDir = process.cwd();
  const dotenvPath = path.resolve(rootDir, ".env");
  const encryptedEnvPath = path.resolve(rootDir, ".env-encrypted");
  const unencryptedEnvPath = path.resolve(rootDir, ".env-unencrypted.env");

  enforceFilesExists([encryptedEnvPath, unencryptedEnvPath]);

  let parsed = {};
  try {
    parsed = dotenv.parse(fs.readFileSync(dotenvPath, { encoding }), {
      debug,
    });
  } catch (e) {
    logLevel("error", e);
  }

  const oldUnencryptedFile = fs.readFileSync(unencryptedEnvPath, "utf8");
  const { secretKey } = envParse.parse(oldUnencryptedFile);
  const { env: unencryptedEnv } = envParse.parse(
    decrypt(secretKey, fs.readFileSync(encryptedEnvPath, "utf8"))
  );

  const newEncryptedFile = envParse.stringify(unencryptedEnv, secretKey);
  if (oldUnencryptedFile !== newEncryptedFile) {
    log(envFileUpdateNotice);
  }
  fs.writeFileSync(unencryptedEnvPath, newEncryptedFile);

  setProcessVars(parsed, debug);

  let groupTarget = process.env._ENV_GROUP_TARGET;
  if (Object.keys(unencryptedEnv).length === 0) {
    logLevel("error", "No encrypted env specified!");
  }

  const rawSyncedEnv = [
    unencryptedEnv.__base || "",
    groupTarget ? unencryptedEnv[groupTarget] : "",
  ].join("\n");
  const syncedEnv = dotenv.parse(rawSyncedEnv);

  setProcessVars(syncedEnv, debug);

  return { ...syncedEnv, ...parsed };
};

module.exports = {
  config,
  parse: dotenv.parse,
};
