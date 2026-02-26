const CsvLoader = require("../../src/loaders/csv-loader");
const DataSource = require("../../src/core/data-source");
const { Readable } = require("stream");
const fs = require("fs");

jest.mock("fs");
jest.mock("../../src/utils/logger"); // Silence logger

describe("CsvLoader File", () => {
  test("should parse CSV file stream", async () => {
    const csvContent = "id,name\n1,alice";
    const stream = Readable.from(csvContent);

    const source = DataSource.file("test.csv");
    // Mock fs.createReadStream
    fs.createReadStream = jest.fn().mockReturnValue(stream);

    const loader = new CsvLoader(source);

    const results = [];
    for await (const r of loader.load()) results.push(r);

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({ id: "1", name: "alice" });
  });

  test("should parse CSV string in memory", async () => {
    const csvContent = "id,name\n1,alice";
    const source = DataSource.memory(csvContent);
    const loader = new CsvLoader(source);

    const results = [];
    for await (const r of loader.load()) results.push(r);

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({ id: "1", name: "alice" });
  });

  test("should throw on invalid memory data", async () => {
    const source = DataSource.memory(123); // Invalid type
    const loader = new CsvLoader(source);

    const generator = loader.load();
    await expect(generator.next()).rejects.toThrow("Invalid memory data");
  });
});
