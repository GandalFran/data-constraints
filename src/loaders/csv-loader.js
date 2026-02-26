const StreamLoader = require("./stream-loader");
const { parse } = require("csv-parse");

/**
 * Loader class that streams items from a CSV file or parses an in-memory CSV string.
 * @extends {StreamLoader}
 */
class CsvLoader extends StreamLoader {
  /**
   * @param {import('../core/data-source')} dataSource
   * @param {object} [options] - csv-parse options
   */
  constructor(dataSource, options = {}) {
    super(dataSource);
    this.options = {
      columns: true,
      skip_empty_lines: true,
      ...options,
    };
  }

  /**
   * Loads the data as an AsyncGenerator yielding individual parsed CSV records.
   * @returns {AsyncGenerator<object, void, unknown>}
   */
  async *load() {
    if (this.dataSource.type === "memory") {
      const data = this.dataSource.source;
      // If it's already an array of objects, just yield
      if (Array.isArray(data)) {
        for (const item of data) {
          yield item;
        }
        return;
      }
      // If it's a string (CSV content), parse it
      if (typeof data === "string") {
        const parser = parse(data, this.options);
        for await (const record of parser) {
          yield record;
        }
        return;
      }
      throw new Error("Invalid memory data for CSV loader");
    }

    // File source
    const fileStream = this.dataSource.getStreamOrData();
    const parser = fileStream.pipe(parse(this.options));

    for await (const record of parser) {
      yield record;
    }
  }
}

module.exports = CsvLoader;
