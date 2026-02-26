const DataEngine = require("../../src/core/engine");
const DataSource = require("../../src/core/data-source");
const JsonLoader = require("../../src/loaders/json-loader");
const { FormatConstraint } = require("../../src/constraints");
const logger = require("../../src/utils/logger");

// Disable logs during test
logger.setEnabled(false);

class MockReporter {
  constructor() {
    this.issues = [];
  }
  report(issue) {
    this.issues.push(issue);
  }
  error(err) {
    console.error(err);
  }
  finish() {}
}

describe("DataEngine Integration", () => {
  test("should run validation flow", async () => {
    const engine = new DataEngine({});

    // Setup Memory Source
    const data = [
      { id: "1", email: "valid@example.com" },
      { id: "2", email: "invalid" },
    ];
    engine.addSource("users", DataSource.memory(data), JsonLoader);

    // Add Constraint
    const constraint = new FormatConstraint("email-check")
      .setField("email")
      .setRegex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
      .setService("users"); // Important!

    engine.addConstraint(constraint);

    // Run
    const reporter = new MockReporter();
    await engine.run(reporter);

    expect(reporter.issues.length).toBe(1);
    expect(reporter.issues[0].id).toBe("email-check");
    expect(reporter.issues[0].record.id).toBe("2");
  });
});
