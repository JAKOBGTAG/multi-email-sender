import fs from 'fs/promises';

/**
 * Log levels
 */
export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

/**
 * Comprehensive logging utility for email operations
 */
export class Logger {
  /**
   * Create a new Logger instance
   * @param {Object} options - Logger options
   * @param {boolean} [options.enableLogging=true] - Enable logging
   * @param {string} [options.logFile='email-logs.json'] - Log file path
   */
  constructor(options = {}) {
    this.enableLogging = options.enableLogging !== false;
    this.logFile = options.logFile || 'email-logs.json';
    this.logs = [];
    this.maxLogEntries = 10000; // Prevent memory issues
  }

  /**
   * Log a debug message
   * @param {string} message - Log message
   * @param {Object} [data] - Additional data
   */
  debug(message, data = {}) {
    this._log(LOG_LEVELS.DEBUG, 'DEBUG', message, data);
  }

  /**
   * Log an info message
   * @param {string} message - Log message
   * @param {Object} [data] - Additional data
   */
  info(message, data = {}) {
    this._log(LOG_LEVELS.INFO, 'INFO', message, data);
  }

  /**
   * Log a warning message
   * @param {string} message - Log message
   * @param {Object} [data] - Additional data
   */
  warn(message, data = {}) {
    this._log(LOG_LEVELS.WARN, 'WARN', message, data);
  }

  /**
   * Log an error message
   * @param {string} message - Log message
   * @param {Object} [data] - Additional data
   */
  error(message, data = {}) {
    this._log(LOG_LEVELS.ERROR, 'ERROR', message, data);
  }

  /**
   * Log a fatal message
   * @param {string} message - Log message
   * @param {Object} [data] - Additional data
   */
  fatal(message, data = {}) {
    this._log(LOG_LEVELS.FATAL, 'FATAL', message, data);
  }

  /**
   * Get all logs
   * @returns {Array} Array of log entries
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Get logs by level
   * @param {string} level - Log level
   * @returns {Array} Filtered log entries
   */
  getLogsByLevel(level) {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Get logs by recipient
   * @param {string} recipient - Email recipient
   * @returns {Array} Filtered log entries
   */
  getLogsByRecipient(recipient) {
    return this.logs.filter(log => log.recipient === recipient);
  }

  /**
   * Get logs by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Filtered log entries
   */
  getLogsByDateRange(startDate, endDate) {
    return this.logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Save logs to file
   * @returns {Promise<void>}
   */
  async saveLogsToFile() {
    if (!this.enableLogging) {
      return;
    }

    try {
      const logData = {
        timestamp: new Date().toISOString(),
        logs: this.logs,
        summary: this._generateLogSummary()
      };

      await fs.writeFile(this.logFile, JSON.stringify(logData, null, 2));
    } catch (error) {
      console.error('Failed to save logs to file:', error.message);
    }
  }

  /**
   * Load logs from file
   * @returns {Promise<void>}
   */
  async loadLogsFromFile() {
    if (!this.enableLogging) {
      return;
    }

    try {
      const data = await fs.readFile(this.logFile, 'utf8');
      const logData = JSON.parse(data);

      if (logData.logs && Array.isArray(logData.logs)) {
        this.logs = logData.logs;
      }
    } catch (error) {
      // File doesn't exist or is invalid, start with empty logs
      this.logs = [];
    }
  }

  /**
   * Get log statistics
   * @returns {Object} Log statistics
   */
  getLogStatistics() {
    const stats = {
      total: this.logs.length,
      byLevel: {},
      byRecipient: {},
      errors: 0,
      warnings: 0,
      timeRange: null
    };

    if (this.logs.length === 0) {
      return stats;
    }

    // Calculate time range
    const timestamps = this.logs.map(log => new Date(log.timestamp));
    stats.timeRange = {
      start: new Date(Math.min(...timestamps)),
      end: new Date(Math.max(...timestamps))
    };

    // Count by level and recipient
    this.logs.forEach(log => {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;

      if (log.recipient) {
        stats.byRecipient[log.recipient] = (stats.byRecipient[log.recipient] || 0) + 1;
      }

      if (log.level === 'ERROR' || log.level === 'FATAL') {
        stats.errors++;
      } else if (log.level === 'WARN') {
        stats.warnings++;
      }
    });

    return stats;
  }

  /**
   * Internal log method
   * @private
   * @param {number} level - Log level number
   * @param {string} levelName - Log level name
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  _log(level, levelName, message, data) {
    if (!this.enableLogging) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: levelName,
      message,
      ...data
    };

    this.logs.push(logEntry);

    // Prevent memory issues by limiting log entries
    if (this.logs.length > this.maxLogEntries) {
      this.logs = this.logs.slice(-this.maxLogEntries);
    }

    // Also log to console for immediate feedback
    this._logToConsole(levelName, message, data);
  }

  /**
   * Log to console
   * @private
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  _logToConsole(level, message, data) {
    const timestamp = new Date().toISOString();
    const dataStr = Object.keys(data).length > 0 ? ` ${JSON.stringify(data)}` : '';

    const logMessage = `[${timestamp}] ${level}: ${message}${dataStr}`;

    switch (level) {
    case 'DEBUG':
      console.debug(logMessage);
      break;
    case 'INFO':
      console.info(logMessage);
      break;
    case 'WARN':
      console.warn(logMessage);
      break;
    case 'ERROR':
    case 'FATAL':
      console.error(logMessage);
      break;
    default:
      console.log(logMessage);
    }
  }

  /**
   * Generate log summary
   * @private
   * @returns {Object} Log summary
   */
  _generateLogSummary() {
    const stats = this.getLogStatistics();

    return {
      totalLogs: stats.total,
      errorCount: stats.errors,
      warningCount: stats.warnings,
      timeRange: stats.timeRange,
      uniqueRecipients: Object.keys(stats.byRecipient).length,
      levelBreakdown: stats.byLevel
    };
  }

  /**
   * Detect auto-response emails
   * @param {string} subject - Email subject
   * @param {string} content - Email content
   * @returns {boolean} True if appears to be auto-response
   */
  static detectAutoResponse(subject, content) {
    const autoResponsePatterns = [
      /auto.?reply/i,
      /out.?of.?office/i,
      /vacation.?response/i,
      /automatic.?reply/i,
      /away.?message/i,
      /delivery.?status.?notification/i,
      /mail.?delivery.?subsystem/i,
      /undelivered.?mail/i,
      /returned.?mail/i
    ];

    const text = `${subject} ${content}`.toLowerCase();
    return autoResponsePatterns.some(pattern => pattern.test(text));
  }

  /**
   * Format log entry for display
   * @param {Object} logEntry - Log entry object
   * @returns {string} Formatted log entry
   */
  static formatLogEntry(logEntry) {
    const timestamp = new Date(logEntry.timestamp).toLocaleString();
    const dataStr = Object.keys(logEntry)
      .filter(key => !['timestamp', 'level', 'message'].includes(key))
      .map(key => `${key}: ${logEntry[key]}`)
      .join(', ');

    return `[${timestamp}] ${logEntry.level}: ${logEntry.message}${dataStr ? ` (${dataStr})` : ''}`;
  }
}
