function parse(str) {
  const headerReg = /#\s*\n#\s*([A-za-z]+)\s*\n#/g;

  const envGroups = str
    .split(headerReg)
    .map((s) => s.trim())
    .filter(Boolean);

  const env = {};

  for (let i = 0; i < envGroups.length; i += 2) {
    env[envGroups[i]] = envGroups[i + 1];
  }

  return env;
}

function stringify(env) {
  const strParts = Object.keys(env).map(
    (key) => `#\n# ${key}\n#\n${env[key].trim()}`
  );

  return strParts.join("\n\n");
}

module.exports = {
  parse,
  stringify,
};
