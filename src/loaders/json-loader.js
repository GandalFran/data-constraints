const StreamLoader = require("./stream-loader");
const { chain } = require("stream-chain");
const { parser } = require("stream-json");
const { streamArray } = require("stream-json/streamers/StreamArray");
const { pick } = require("stream-json/filters/Pick");
const logger = require("../utils/logger");

/**
 * Loader class that streams items from a JSON file or in-memory array.
 * Supports plucking nested arrays using json-stream paths.
 * @extends {StreamLoader}
 */
class JsonLoader extends StreamLoader {
  /**
   * @param {import('../core/data-source')} dataSource
   * @param {object} [options] - Options object
   * @param {string} [options.arrayPath] - Optional path to the array in the JSON object
   */
  constructor(dataSource, options = {}) {
    super(dataSource);
    this.arrayPath = options.arrayPath;
    logger.debug("JsonLoader created for source:", dataSource.source);
  }

  /**
   * Loads the data as an AsyncGenerator yielding individual records.
   * @returns {AsyncGenerator<object, void, unknown>}
   */
  async *load() {
    logger.debug("JsonLoader.load() started");
    if (this.dataSource.type === "memory") {
      const data = this.dataSource.source;
      if (Array.isArray(data)) {
        for (const item of data) {
          yield item;
        }
      } else {
        yield data;
      }
      return;
    }

    // File source
    const pipeline = this.arrayPath
      ? chain([parser(), pick({ filter: this.arrayPath }), streamArray()])
      : chain([parser(), streamArray()]);

    const fileStream = this.dataSource.getStreamOrData();
    logger.debug("File stream created for:", this.dataSource.source);

    fileStream.on("error", (err) => {
      logger.error("File stream error:", err);
      pipeline.destroy(err);
    });
    pipeline.on("error", (err) => logger.error("Pipeline error:", err));

    fileStream.pipe(pipeline);

    try {
      for await (const item of pipeline) {
        yield item.value;
      }
    } catch (err) {
      logger.error("JsonLoader iteration error:", err);
      throw err;
    }
    logger.debug("JsonLoader.load() finished");
  }
}

module.exports = JsonLoader;
