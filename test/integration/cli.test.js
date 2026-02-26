const { exec } = require("child_process");
const path = require("path");

const cliPath = path.join(__dirname, "../../src/cli.js");

describe("CLI Integration", () => {
  jest.setTimeout(20000); // Increase timeout to 20s

  test("should show help", (done) => {
    exec(`node ${cliPath} --help`, (error, stdout) => {
      expect(error).toBeNull();
      expect(stdout).toContain("Usage: data-constraints");
      done();
    });
  });

  test("should fail with invalid command", (done) => {
    exec(`node ${cliPath} invalid`, (error, stdout, stderr) => {
      expect(error).not.toBeNull();
      expect(stderr).toContain("error: unknown command");
      done();
    });
  });

  test("should validate files with config", (done) => {
    const configPath = path.join(
      __dirname,
      "../../docs/examples/user-catalog/config.json",
    );
    const dataDir = path.join(
      __dirname,
      "../../docs/examples/user-catalog/data",
    );

    const cmd = `node ${cliPath} validate --config ${configPath} --data ${dataDir}`;

    exec(cmd, (error, stdout) => {
      if (error) {
        // It might exit with 1 if issues found
      }
      // The output might differ depending on issues found in examples/data/users.json
      // We know it finds issues.
      expect(stdout).toContain("Validation finished");
      done();
    });
  });
});
