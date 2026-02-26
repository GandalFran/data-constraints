const DataSource = require("../../src/core/data-source");
const registry = require("../../src/core/registry");
const ConstraintBase = require("../../src/constraints/base");
const DataEngine = require("../../src/core/engine");
const ValidationError = require("../../src/errors/validation-error");
const JsonLoader = require("../../src/loaders/json-loader");

describe("DataSource", () => {
  test("should create memory data source", () => {
    const data = [{ id: 1 }];
    const source = DataSource.memory(data);
    expect(source.type).toBe("memory");
    expect(source.source).toBe(data);
    expect(source.getStreamOrData()).toBe(data);
  });

  test("should create file data source", () => {
    const path = "/tmp/test.json";
    const source = DataSource.file(path);
    expect(source.type).toBe("file");
    expect(source.source).toBe(path);
    // getStreamOrData would try to open file, so we don't test it here without mocking fs
  });
});

describe("ConstraintRegistry", () => {
  class MockConstraint extends ConstraintBase {
    static fromJSON(json) {
      return new MockConstraint(json.type, json.id);
    }
  }

  test("should register and create constraints", () => {
    registry.register("mock", MockConstraint);

    const config = { type: "mock", id: "test-1" };
    const constraint = registry.create(config);

    expect(constraint).toBeInstanceOf(MockConstraint);
    expect(constraint.id).toBe("test-1");
  });

  test("should throw on unknown type", () => {
    expect(() => {
      registry.create({ type: "unknown" });
    }).toThrow("Unknown constraint type: unknown");
  });
});

describe("DataEngine", () => {
  class FailingConstraint extends ConstraintBase {
    constructor() {
      super("fail", "f1");
      this.service = "test";
    }
    async validate() {
      return { id: this.id, type: this.type, message: "fail" };
    }
  }

  test("should use ExceptionReporter by default and throw if issues found", async () => {
    const engine = new DataEngine({});
    engine.addSource("test", DataSource.memory([{}]), JsonLoader);
    engine.addConstraint(new FailingConstraint());

    await expect(engine.run()).rejects.toThrow(ValidationError);
  });

  test("should not throw if no issues found with default reporter", async () => {
    class PassingConstraint extends ConstraintBase {
      constructor() {
        super("pass", "p1");
        this.service = "test";
      }
      async validate() {
        return null;
      }
    }

    const engine = new DataEngine({});
    engine.addSource("test", DataSource.memory([{}]), JsonLoader);
    engine.addConstraint(new PassingConstraint());

    await expect(engine.run()).resolves.toBeUndefined();
  });
});
