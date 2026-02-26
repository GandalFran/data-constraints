const chalk = require("chalk");

const LEVELS = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
};

class Logger {
  constructor() {
    this.level = LEVELS.INFO; // Default level
  }

  setLevel(levelName) {
    const key = levelName.toUpperCase();
    if (LEVELS[key] !== undefined) {
      this.level = LEVELS[key];
    }
  }

  /**
   * Enable/Disable logging.
   * @param {boolean} enabled - If false, sets level to NONE. If true, sets to INFO (default).
   */
  setEnabled(enabled) {
    if (!enabled) {
      this.level = LEVELS.NONE;
    } else if (this.level === LEVELS.NONE) {
      this.level = LEVELS.INFO;
    }
  }

  debug(...args) {
    if (this.level >= LEVELS.DEBUG) {
      console.log(chalk.gray("[DEBUG]"), ...args);
    }
  }

  info(...args) {
    if (this.level >= LEVELS.INFO) {
      console.log(chalk.blue("[INFO]"), ...args);
    }
  }

  warn(...args) {
    if (this.level >= LEVELS.WARN) {
      console.warn(chalk.yellow("[WARN]"), ...args);
    }
  }

  error(...args) {
    if (this.level >= LEVELS.ERROR) {
      console.error(chalk.red("[ERROR]"), ...args);
    }
  }
}

// Singleton instance
module.exports = new Logger();
