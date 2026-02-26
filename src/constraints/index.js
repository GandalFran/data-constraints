const FormatConstraint = require("./format");
const UniqueConstraint = require("./unique");
const ForeignKeyConstraint = require("./foreign-key");
const registry = require("../core/registry");

// Register core constraints
registry.register("format", FormatConstraint);
registry.register("unique", UniqueConstraint);
registry.register("foreign-key", ForeignKeyConstraint);

module.exports = {
  FormatConstraint,
  UniqueConstraint,
  ForeignKeyConstraint,
};
