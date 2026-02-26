const { program } = require("../../src/cli");
const DataEngine = require("../../src/core/engine");
const path = require("path");

jest.mock("../../src/core/engine");
jest.mock("../../src/utils/logger");
jest.mock("fs");
jest.mock("../../src/utils/config-loader");

describe("CLI Unit", () => {
  let exitMock;

  beforeEach(() => {
    exitMock = jest.spyOn(process, "exit").mockImplementation(() => {});
    require("fs").existsSync.mockReturnValue(true);
    require("fs").lstatSync.mockReturnValue({ isDirectory: () => true });
    require("fs").readdirSync.mockReturnValue([]);
  });

  afterEach(() => {
    if (exitMock) exitMock.mockRestore();
    jest.clearAllMocks();
  });

  test("should execute validate action", async () => {
    const validateCmd = program.commands.find((c) => c.name() === "validate");
    const engineMock = {
      addSource: jest.fn(),
      addConstraint: jest.fn(),
      run: jest.fn().mockResolvedValue(),
    };
    DataEngine.mockImplementation(() => engineMock);
    require("../../src/utils/config-loader").loadConfig.mockReturnValue({});

    const configPath = path.join(__dirname, "../../docs/examples/config.json");
    const dataPath = path.join(__dirname, "../../docs/examples/data");

    await validateCmd.parseAsync([
      "node",
      "cli",
      "validate",
      "--config",
      configPath,
      "--data",
      dataPath,
    ]);

    expect(DataEngine).toHaveBeenCalled();
    expect(engineMock.run).toHaveBeenCalled();
  });

  test("should select json reporter", async () => {
    const validateCmd = program.commands.find((c) => c.name() === "validate");
    const engineMock = {
      addSource: jest.fn(),
      addConstraint: jest.fn(),
      run: jest.fn().mockResolvedValue(),
    };
    DataEngine.mockImplementation(() => engineMock);
    require("../../src/utils/config-loader").loadConfig.mockReturnValue({});

    const configPath = path.join(__dirname, "../../docs/examples/config.json");
    await validateCmd.parseAsync([
      "node",
      "cli",
      "validate",
      "--config",
      configPath,
      "--format",
      "json",
    ]);

    expect(engineMock.run).toHaveBeenCalled();
    const reporter = engineMock.run.mock.calls[0][0];
    expect(reporter.constructor.name).toBe("JsonReporter");
  });

  test("should select markdown reporter", async () => {
    const validateCmd = program.commands.find((c) => c.name() === "validate");
    const engineMock = {
      addSource: jest.fn(),
      addConstraint: jest.fn(),
      run: jest.fn().mockResolvedValue(),
    };
    DataEngine.mockImplementation(() => engineMock);
    require("../../src/utils/config-loader").loadConfig.mockReturnValue({});

    const configPath = path.join(__dirname, "../../docs/examples/config.json");
    await validateCmd.parseAsync([
      "node",
      "cli",
      "validate",
      "--config",
      configPath,
      "--format",
      "markdown",
    ]);

    expect(engineMock.run).toHaveBeenCalled();
    const reporter = engineMock.run.mock.calls[0][0];
    expect(reporter.constructor.name).toBe("MarkdownReporter");
  });

  test("should handle error", async () => {
    const validateCmd = program.commands.find((c) => c.name() === "validate");
    const engineMock = {
      addSource: jest.fn(),
      addConstraint: jest.fn(),
      run: jest.fn().mockRejectedValue(new Error("Test Error")),
    };
    DataEngine.mockImplementation(() => engineMock);
    require("../../src/utils/config-loader").loadConfig.mockReturnValue({});

    const configPath = path.join(__dirname, "../../docs/examples/config.json");

    await validateCmd.parseAsync([
      "node",
      "cli",
      "validate",
      "--config",
      configPath,
    ]);

    expect(exitMock).toHaveBeenCalledWith(1);
  });
});
