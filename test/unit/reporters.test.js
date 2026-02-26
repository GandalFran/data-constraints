const ConsoleReporter = require("../../src/reporters/console-reporter");
const JsonReporter = require("../../src/reporters/json-reporter");
const MarkdownReporter = require("../../src/reporters/markdown-reporter");
const ExceptionReporter = require("../../src/reporters/exception-reporter");
const ValidationError = require("../../src/errors/validation-error");
const fs = require("fs");
const logger = require("../../src/utils/logger");

jest.mock("fs");
jest.mock("../../src/utils/logger");

describe("Reporters", () => {
  const issue = { type: "test", id: "t1", message: "error", record: { id: 1 } };

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
  });

  describe("ConsoleReporter", () => {
    test("should log individual issues and summary", () => {
      const reporter = new ConsoleReporter();
      reporter.report(issue);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("[t1]"),
        expect.stringContaining("(test)"),
        "error",
      );

      reporter.finish();
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Found 1 issues"),
      );
    });
  });

  describe("JsonReporter", () => {
    test("should log JSON to console if no path", () => {
      const reporter = new JsonReporter();
      reporter.report(issue);
      reporter.finish();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"id": "t1"'),
      );
    });

    test("should write JSON to file if path provided", () => {
      const reporter = new JsonReporter("/tmp/out.json");
      reporter.report(issue);
      reporter.finish();
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        "/tmp/out.json",
        expect.stringContaining('"id": "t1"'),
      );
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Report written"),
      );
    });
  });

  describe("MarkdownReporter", () => {
    test("should log Markdown to console if no path", () => {
      const reporter = new MarkdownReporter();
      reporter.report(issue);
      reporter.finish();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("## Constraint: `t1`"),
      );
    });

    test("should write Markdown to file if path provided", () => {
      const reporter = new MarkdownReporter("/tmp/out.md");
      reporter.report(issue);
      reporter.finish();
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        "/tmp/out.md",
        expect.stringContaining("## Constraint: `t1`"),
      );
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Markdown report written"),
      );
    });

    test("should report success if no issues", () => {
      const reporter = new MarkdownReporter();
      reporter.finish();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("No issues found"),
      );
    });
  });

  describe("ExceptionReporter", () => {
    test("should throw ValidationError on finish if there are issues", () => {
      const reporter = new ExceptionReporter();
      reporter.report(issue);

      expect(() => {
        reporter.finish();
      }).toThrow(ValidationError);

      try {
        reporter.finish();
      } catch (err) {
        expect(err.name).toBe("ValidationError");
        expect(err.violations).toHaveLength(1);
        expect(err.violations[0]).toBe(issue);
      }
    });

    test("should not throw if there are no issues", () => {
      const reporter = new ExceptionReporter();
      expect(() => {
        reporter.finish();
      }).not.toThrow();
    });
  });
});
