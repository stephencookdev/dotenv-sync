// note, #~~ is considered a private comment, ignorable by the parser as a whole

const watermark = `
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
#~~ This file is autogenerated, any unsynced edits will be overwritten ~~#
#~~           To sync edits here, run $(npm bin)/dotenv-sync           ~~#
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
`.trim();
const secretKeyStringGen = (key) =>
  `
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
#~~ Ignore below here, this is the key to encrypt/decrypt your env vars ~~#
#~~secretKey::::${key}
`.trim();

function parse(str) {
  const internalCommentRegex = /^#~~.*$/gm;
  const headerReg = /#\s*\n#\s*([A-za-z]+)\s*\n#/g;

  const envGroups = str
    .replaceAll(internalCommentRegex, "")
    .split(headerReg)
    .map((s) => s.trim())
    .filter(Boolean);

  const env = {};

  for (let i = 0; i < envGroups.length; i += 2) {
    env[envGroups[i]] = envGroups[i + 1];
  }

  const secretKey = (/^#~~secretKey::::(.*)$/m.exec(str) || [])[1];

  return { env, secretKey };
}

function stringify(env, secretKey) {
  const strParts = Object.keys(env).map(
    (key) => `#\n# ${key}\n#\n${env[key].trim()}`
  );

  const stringified = strParts.join("\n\n");
  if (secretKey && secretKey.__omit) {
    return stringified;
  }

  return (
    watermark +
    "\n".repeat(2) +
    stringified +
    "\n".repeat(50) +
    secretKeyStringGen(secretKey)
  );
}

module.exports = {
  parse,
  stringify,
};
