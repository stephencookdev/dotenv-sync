const dotenv = require("dotenv");

const parse = dotenv.parse;

const setProcessVars = (config, debug) => {
  Object.keys(config).forEach(function (key) {
    if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
      process.env[key] = config[key];
    } else if (debug) {
      log(
        `"${key}" is already defined in \`process.env\` and will not be overwritten`
      );
    }
  });
};

const config = ({ encoding = "utf8", debug = false } = {}) => {
  if (process.env.NODE_ENV === "production") {
    return dotenv.config({ encoding, debug });
  }

  const fs = require("fs");
  const path = require("path");
  const { decrypt } = require("./encryption");
  const envParse = require("./envParse");

  const rootDir = process.cwd();
  const dotenvPath = path.resolve(rootDir, ".env");
  const secretKeyPath = path.resolve(rootDir, ".secretKey.env");
  const encryptedEnvJsonPath = path.resolve(rootDir, ".encrypted.env");
  const unencryptedEnvJsonPath = path.resolve(rootDir, ".unencrypted.env");

  const parsed = parse(fs.readFileSync(dotenvPath, { encoding }), { debug });
  const secretKey = fs.readFileSync(secretKeyPath, "utf8");

  const unencryptedEnvJson = envParse.parse(
    decrypt(secretKey, fs.readFileSync(encryptedEnvJsonPath, "utf8"))
  );

  fs.writeFileSync(
    unencryptedEnvJsonPath,
    envParse.stringify(unencryptedEnvJson)
  );

  setProcessVars(parsed, debug);

  let groupTarget = process.env._ENV_GROUP_TARGET;
  if (Object.keys(unencryptedEnvJson).length === 0) {
    console.error("No encrypted env specified!");
  } else if (!groupTarget) {
    groupTarget = Object.keys(unencryptedEnvJson)[0];
    console.error(
      `No _ENV_GROUP_TARGET specified, falling back on '${groupTarget}'`
    );
  }

  const syncedEnv = parse(unencryptedEnvJson[groupTarget] || "");

  setProcessVars(syncedEnv, debug);

  return { ...syncedEnv, ...parsed };
};

module.exports = {
  config,
  parse,
};
