const Logger = require("../../src/utils/logger");
const configLoader = require("../../src/utils/config-loader");
const fs = require("fs");

jest.mock("fs");

describe("Logger", () => {
  beforeEach(() => {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  test("should log based on levels", () => {
    Logger.setLevel("DEBUG");
    Logger.debug("d");
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("[DEBUG]"),
      "d",
    );

    Logger.setLevel("WARN");
    Logger.info("i");
    expect(console.log).not.toHaveBeenCalledWith(
      expect.stringContaining("[INFO]"),
      "i",
    );

    Logger.warn("w");
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("[WARN]"),
      "w",
    );
  });

  test("should enable/disable", () => {
    Logger.setEnabled(false);
    Logger.error("e");
    expect(console.error).not.toHaveBeenCalled();

    Logger.setEnabled(true);
    Logger.setLevel("ERROR");
    Logger.error("e");
    expect(console.error).toHaveBeenCalled();
  });
});

describe("ConfigLoader", () => {
  test("should load JSON conf", () => {
    fs.readFileSync.mockReturnValue('{"a":1}');
    const c = configLoader.loadConfig("test.json");
    expect(c).toEqual({ a: 1 });
  });

  test("should load YAML conf", () => {
    fs.readFileSync.mockReturnValue("a: 1");
    const c = configLoader.loadConfig("test.yaml");
    expect(c).toEqual({ a: 1 });
  });

  test("should throw on invalid JSON", () => {
    fs.readFileSync.mockReturnValue("{invalid");
    expect(() => configLoader.loadConfig("test.json")).toThrow();
  });

  test("should throw on unsupported extension", () => {
    expect(() => configLoader.loadConfig("test.txt")).toThrow(
      "Unsupported config extension",
    );
  });
});

describe("PropertyAccessor", () => {
  const { getValues } = require("../../src/utils/property-accessor");

  test("should get simple property", () => {
    expect(getValues({ a: 1 }, "a")).toBe(1);
  });

  test("should get nested property", () => {
    expect(getValues({ a: { b: 1 } }, "a.b")).toBe(1);
  });

  test("should get array property (no mapping)", () => {
    expect(getValues({ a: [1, 2] }, "a")).toEqual([1, 2]);
  });

  test("should map over array", () => {
    // a is array, get b from each element
    const data = { a: [{ b: 1 }, { b: 2 }] };
    expect(getValues(data, "a.b")).toEqual([1, 2]);
  });

  test("should map over array using index", () => {
    // a[0].b
    const data = { a: [{ b: 1 }, { b: 2 }] };
    expect(getValues(data, "a[0].b")).toBe(1);
    expect(getValues(data, "a.0.b")).toBe(1);
  });

  test("should handle nested arrays", () => {
    // a is array of objects, each has b array of objects, with c
    const data = {
      a: [{ b: [{ c: 1 }, { c: 2 }] }, { b: [{ c: 3 }] }],
    };
    // a.b -> [[{c:1}, {c:2}], [{c:3}]] ... flattened?
    // getValues flattens when mapping.
    // a maps to b. result is all b arrays combined?
    // Let's check logic:
    // Key a -> val is array of objects.
    // Key b -> val is array of objects.
    // next loop: a[0].b (array), a[1].b (array).
    // spreading arrays into next. next = [{c:1}, {c:2}, {c:3}].
    // Key c -> 1, 2, 3.
    expect(getValues(data, "a.b.c")).toEqual([1, 2, 3]);
  });

  test("should handle mixed simple and array access", () => {
    const data = {
      items: [
        { id: 1, tags: ["x", "y"] },
        { id: 2, tags: ["z"] },
      ],
    };
    expect(getValues(data, "items.id")).toEqual([1, 2]);
    expect(getValues(data, "items.tags")).toEqual(["x", "y", "z"]);
  });
});
