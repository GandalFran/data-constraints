/**
 * Base class for Data Loaders.
 * Loaders are responsible for taking a DataSource and returning an AsyncIterable
 * of records.
 */
class StreamLoader {
  /**
   * @param {import('../core/data-source')} dataSource
   */
  constructor(dataSource) {
    this.dataSource = dataSource;
  }

  /**
   * Returns an AsyncIterable that yields records one by one.
   * @returns {AsyncIterable<any>}
   */
  // eslint-disable-next-line require-yield
  async *load() {
    throw new Error("Method load() must be implemented");
  }

  /**
   * Helper to determine validation context (e.g., line number)
   * @param {any} record
   * @param {number} index
   */
  createContext(record, index) {
    return { record, index };
  }
}

module.exports = StreamLoader;
