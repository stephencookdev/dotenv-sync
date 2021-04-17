function log(message, { debug } = {}) {
  logLevel("log", message, debug);
}

function logLevel(level, message, { debug } = {}) {
  console[level](`[dotenv-sync]${debug ? "[DEBUG]" : ""} ${message}`);
}

module.exports = { log, logLevel };
