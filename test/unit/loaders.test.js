const CsvLoader = require("../../src/loaders/csv-loader");
const JsonLoader = require("../../src/loaders/json-loader");
const DataSource = require("../../src/core/data-source");
const { Readable } = require("stream");

jest.mock("fs");
jest.mock("../../src/utils/logger"); // Silence logger

describe("Loaders", () => {
  describe("CsvLoader", () => {
    test("should load CSV from memory", async () => {
      const data = [{ a: 1 }];
      const source = DataSource.memory(data);
      const loader = new CsvLoader(source);
      const results = [];
      for await (const r of loader.load()) results.push(r);
      expect(results).toEqual(data);
    });

    test("should parse CSV stream", async () => {
      const csvContent = "id,name\n1,alice\n2,bob";
      const stream = Readable.from(csvContent);

      const source = {
        type: "file",
        getStreamOrData: () => stream,
        source: "test.csv",
      };
      const loader = new CsvLoader(source);

      const results = [];
      for await (const r of loader.load()) results.push(r);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({ id: "1", name: "alice" });
    });
  });

  describe("JsonLoader", () => {
    test("should load JSON from memory", async () => {
      const data = [{ a: 1 }];
      const source = DataSource.memory(data);
      const loader = new JsonLoader(source);
      const results = [];
      for await (const r of loader.load()) results.push(r);
      expect(results).toEqual(data);
    });

    test("should parse JSON stream (array)", async () => {
      const jsonContent = JSON.stringify([{ id: 1 }, { id: 2 }]);
      const stream = Readable.from(jsonContent);

      const source = {
        type: "file",
        getStreamOrData: () => stream,
        source: "test.json",
      };
      const loader = new JsonLoader(source);

      const results = [];
      for await (const r of loader.load()) results.push(r);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({ id: 1 });
    });

    test("should parse nested JSON stream with arrayPath", async () => {
      const jsonContent = JSON.stringify({ items: [{ id: 1 }, { id: 2 }] });
      const stream = Readable.from(jsonContent);

      const source = {
        type: "file",
        getStreamOrData: () => stream,
        source: "test.json",
      };
      const loader = new JsonLoader(source, { arrayPath: "items" });

      const results = [];
      for await (const r of loader.load()) results.push(r);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({ id: 1 });
    });
  });
});
