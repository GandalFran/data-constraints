const fs = require("fs");
const yaml = require("yaml");
const path = require("path");

function loadConfig(configPath) {
  const content = fs.readFileSync(configPath, "utf8");
  const ext = path.extname(configPath).toLowerCase();

  if (ext === ".yaml" || ext === ".yml") {
    return yaml.parse(content);
  } else if (ext === ".json") {
    return JSON.parse(content);
  } else {
    throw new Error(`Unsupported config extension: ${ext}`);
  }
}

module.exports = { loadConfig };
