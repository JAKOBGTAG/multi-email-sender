/**
 * Retry logic with exponential backoff and jitter
 */
export class RetryLogic {
  /**
   * Create a new RetryLogic instance
   * @param {Object} options - Retry options
   * @param {number} [options.maxRetries=3] - Maximum retry attempts
   * @param {number} [options.retryDelay=1000] - Base delay for retries
   */
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.retryDelay || 1000;
    this.maxDelay = 30000; // 30 seconds max delay
  }

  /**
   * Execute function with retry logic
   * @param {Function} fn - Function to execute
   * @param {Object} [context] - Context for error handling
   * @returns {Promise<any>} Function result
   */
  async executeWithRetry(fn, _context = {}) {
    let lastError;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Don't retry on certain types of errors
        if (this._shouldNotRetry(error)) {
          throw error;
        }

        // Don't delay after the last attempt
        if (attempt < this.maxRetries) {
          const delay = this._calculateDelay(attempt, error);
          await this._delay(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Calculate delay with exponential backoff and jitter
   * @private
   * @param {number} attempt - Current attempt number
   * @param {Error} error - Error that occurred
   * @returns {number} Delay in milliseconds
   */
  _calculateDelay(attempt, error) {
    // Base exponential backoff
    let delay = this.baseDelay * Math.pow(2, attempt - 1);

    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay;
    delay += jitter;

    // Apply error-specific multipliers
    delay = this._applyErrorMultiplier(delay, error);

    // Cap the maximum delay
    return Math.min(delay, this.maxDelay);
  }

  /**
   * Apply error-specific delay multipliers
   * @private
   * @param {number} delay - Base delay
   * @param {Error} error - Error that occurred
   * @returns {number} Adjusted delay
   */
  _applyErrorMultiplier(delay, error) {
    const errorMessage = error.message.toLowerCase();

    // Network errors - longer delay
    if (errorMessage.includes('network') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('connection')) {
      return delay * 1.5;
    }

    // Rate limiting - much longer delay
    if (errorMessage.includes('rate') ||
        errorMessage.includes('limit') ||
        errorMessage.includes('quota')) {
      return delay * 3;
    }

    // Authentication errors - moderate delay
    if (errorMessage.includes('auth') ||
        errorMessage.includes('credential') ||
        errorMessage.includes('permission')) {
      return delay * 1.2;
    }

    // SMTP errors - moderate delay
    if (errorMessage.includes('smtp') ||
        errorMessage.includes('mail') ||
        errorMessage.includes('delivery')) {
      return delay * 1.3;
    }

    return delay;
  }

  /**
   * Determine if error should not be retried
   * @private
   * @param {Error} error - Error to check
   * @returns {boolean} True if should not retry
   */
  _shouldNotRetry(error) {
    const errorMessage = error.message.toLowerCase();

    // Don't retry validation errors
    if (errorMessage.includes('validation') ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('malformed')) {
      return true;
    }

    // Don't retry authentication errors that won't be fixed by retrying
    if (errorMessage.includes('invalid credentials') ||
        errorMessage.includes('authentication failed') ||
        errorMessage.includes('unauthorized')) {
      return true;
    }

    // Don't retry if email address is invalid
    if (errorMessage.includes('invalid email') ||
        errorMessage.includes('bad email') ||
        errorMessage.includes('email not found')) {
      return true;
    }

    return false;
  }

  /**
   * Delay execution
   * @private
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get retry statistics
   * @param {Array} results - Array of send results
   * @returns {Object} Retry statistics
   */
  static getRetryStatistics(results) {
    const stats = {
      totalAttempts: 0,
      successfulOnFirstTry: 0,
      successfulAfterRetry: 0,
      failedAfterAllRetries: 0,
      averageAttempts: 0,
      retryDistribution: {}
    };

    if (results.length === 0) {
      return stats;
    }

    results.forEach(result => {
      stats.totalAttempts += result.attempts;

      if (result.success) {
        if (result.attempts === 1) {
          stats.successfulOnFirstTry++;
        } else {
          stats.successfulAfterRetry++;
        }
      } else {
        stats.failedAfterAllRetries++;
      }

      // Track retry distribution
      const { attempts } = result;
      stats.retryDistribution[attempts] = (stats.retryDistribution[attempts] || 0) + 1;
    });

    stats.averageAttempts = stats.totalAttempts / results.length;

    return stats;
  }

  /**
   * Create retry policy for specific error types
   * @param {Object} policies - Error-specific retry policies
   * @returns {Object} Retry policy configuration
   */
  static createRetryPolicy(policies = {}) {
    const defaultPolicy = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitterFactor: 0.1
    };

    return {
      default: defaultPolicy,
      network: {
        ...defaultPolicy,
        maxRetries: 5,
        baseDelay: 2000
      },
      rateLimit: {
        ...defaultPolicy,
        maxRetries: 2,
        baseDelay: 5000,
        maxDelay: 60000
      },
      authentication: {
        ...defaultPolicy,
        maxRetries: 1,
        baseDelay: 1000
      },
      smtp: {
        ...defaultPolicy,
        maxRetries: 4,
        baseDelay: 1500
      },
      ...policies
    };
  }

  /**
   * Calculate optimal retry delay based on error type
   * @param {string} errorType - Type of error
   * @param {number} attempt - Current attempt number
   * @param {Object} policy - Retry policy
   * @returns {number} Optimal delay in milliseconds
   */
  static calculateOptimalDelay(errorType, attempt, policy) {
    const errorPolicy = policy[errorType] || policy.default;

    let delay = errorPolicy.baseDelay * Math.pow(errorPolicy.backoffMultiplier, attempt - 1);

    // Add jitter
    const jitter = Math.random() * errorPolicy.jitterFactor * delay;
    delay += jitter;

    return Math.min(delay, errorPolicy.maxDelay);
  }
}
