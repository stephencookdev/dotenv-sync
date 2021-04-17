const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { log, logLevel } = require("./log");

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
        .join("\n")}`
    );
    logLevel(
      "error",
      "You might need to fix your local workspace, or run `$(npm bin)/dotenv-sync --init` if you are setting this project up"
    );
    process.exit(1);
  }
};

const config = ({ encoding = "utf8", debug = false } = {}) => {
  if (process.env.NODE_ENV === "production") {
    return dotenv.config({ encoding, debug });
  }

  // requiring here to make tree-shaking a bit easier
  const { decrypt } = require("./encryption");
  const envParse = require("./envParse");

  const rootDir = process.cwd();
  const dotenvPath = path.resolve(rootDir, ".env");
  const encryptedEnvPath = path.resolve(rootDir, ".env-encrypted");
  const unencryptedEnvPath = path.resolve(rootDir, ".env-unencrypted.env");

  enforceFilesExists([dotenvPath, encryptedEnvPath, unencryptedEnvPath]);

  const parsed = dotenv.parse(fs.readFileSync(dotenvPath, { encoding }), {
    debug,
  });

  const { secretKey } = envParse.parse(
    fs.readFileSync(unencryptedEnvPath, "utf8")
  );
  const { env: unencryptedEnv } = envParse.parse(
    decrypt(secretKey, fs.readFileSync(encryptedEnvPath, "utf8"))
  );

  fs.writeFileSync(
    unencryptedEnvPath,
    envParse.stringify(unencryptedEnv, secretKey)
  );

  setProcessVars(parsed, debug);

  let groupTarget = process.env._ENV_GROUP_TARGET;
  if (Object.keys(unencryptedEnv).length === 0) {
    logLevel("error", "No encrypted env specified!");
  } else if (!groupTarget) {
    groupTarget = Object.keys(unencryptedEnv)[0];
    logLevel(
      "error",
      `No _ENV_GROUP_TARGET specified, falling back on '${groupTarget}'`
    );
  }

  const syncedEnv = dotenv.parse(unencryptedEnv[groupTarget] || "");

  setProcessVars(syncedEnv, debug);

  return { ...syncedEnv, ...parsed };
};

module.exports = {
  config,
  parse: dotenv.parse,
};
