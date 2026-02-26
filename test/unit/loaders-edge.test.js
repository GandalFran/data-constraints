const StreamLoader = require("../../src/loaders/stream-loader");
const JsonLoader = require("../../src/loaders/json-loader");
const { Readable } = require("stream");

jest.mock("../../src/utils/logger"); // Silence logger

describe("Loader Edge Cases", () => {
  test("StreamLoader abstract load should throw", async () => {
    const loader = new StreamLoader({});
    // We need to consume the generator to trigger execution
    const generator = loader.load();
    await expect(generator.next()).rejects.toThrow(
      "Method load() must be implemented",
    );
  });

  test("JsonLoader handles stream error", async () => {
    const stream = new Readable({
      read() {
        this.emit("error", new Error("Stream failed"));
      },
    });
    const source = {
      type: "file",
      getStreamOrData: () => stream,
      source: "test.json",
    };
    const loader = new JsonLoader(source);

    const generator = loader.load();
    await expect(generator.next()).rejects.toThrow();
  });
});
