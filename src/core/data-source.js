const fs = require("fs");

/**
 * Abstract class representing a source of data.
 * Can be a file path (for streaming) or an in-memory object/array.
 *
 * @example
 * const fileSource = DataSource.file('/path/to/data.json');
 * const memSource = DataSource.memory([{ id: 1, name: 'Test' }]);
 */
class DataSource {
  /**
   * @param {string} type - 'file' or 'memory'
   * @param {string|object|Array} source - The file path or the data object
   */
  constructor(type, source) {
    this.type = type;
    this.source = source;
  }

  /**
   * Creates a file data source.
   * @param {string} filePath - Absolute or relative path to the file
   * @returns {DataSource} A new DataSource instance
   */
  static file(filePath) {
    return new DataSource("file", filePath);
  }

  /**
   * Creates an in-memory data source.
   * @param {object|Array} data - The data to validate
   * @returns {DataSource} A new DataSource instance
   */
  static memory(data) {
    return new DataSource("memory", data);
  }

  /**
   * Returns a readable stream (if file) or the data itself (if memory).
   * Note: This is a low-level method. Loaders should generally use specific logic to handle the stream.
   * @returns {import('stream').Readable|object|Array}
   */
  getStreamOrData() {
    if (this.type === "file") {
      return fs.createReadStream(this.source);
    }
    return this.source;
  }
}

module.exports = DataSource;
