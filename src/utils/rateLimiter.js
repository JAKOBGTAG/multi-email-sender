/**
 * Rate limiting implementation for email sending
 */
export class RateLimiter {
  /**
   * Create a new RateLimiter instance
   * @param {Object} config - Rate limiting configuration
   * @param {boolean} [config.enabled=true] - Enable rate limiting
   * @param {number} [config.maxEmailsPerMinute=10] - Max emails per minute
   * @param {number} [config.maxEmailsPerHour=100] - Max emails per hour
   */
  constructor(config = {}) {
    this.enabled = config.enabled !== false;
    this.maxEmailsPerMinute = config.maxEmailsPerMinute || 10;
    this.maxEmailsPerHour = config.maxEmailsPerHour || 100;

    // Track email timestamps
    this.emailTimestamps = [];
    this.minuteWindow = 60 * 1000; // 1 minute in milliseconds
    this.hourWindow = 60 * 60 * 1000; // 1 hour in milliseconds

    // Statistics
    this.stats = {
      totalEmails: 0,
      rateLimitedEmails: 0,
      averageWaitTime: 0,
      maxWaitTime: 0
    };
  }

  /**
   * Check if email can be sent and wait if necessary
   * @returns {Promise<void>}
   */
  async waitIfNeeded() {
    if (!this.enabled) {
      return;
    }

    const now = Date.now();
    const waitTime = this._calculateWaitTime(now);

    if (waitTime > 0) {
      this.stats.rateLimitedEmails++;
      this.stats.averageWaitTime =
        (this.stats.averageWaitTime * (this.stats.rateLimitedEmails - 1) + waitTime) /
        this.stats.rateLimitedEmails;
      this.stats.maxWaitTime = Math.max(this.stats.maxWaitTime, waitTime);

      await this._delay(waitTime);
    }

    // Record this email send
    this.emailTimestamps.push(now);
    this.stats.totalEmails++;

    // Clean up old timestamps
    this._cleanupOldTimestamps(now);
  }

  /**
   * Check if email can be sent immediately
   * @returns {boolean} True if email can be sent immediately
   */
  canSendImmediately() {
    if (!this.enabled) {
      return true;
    }

    const now = Date.now();
    return this._calculateWaitTime(now) === 0;
  }

  /**
   * Get current rate limit status
   * @returns {Object} Rate limit status
   */
  getStatus() {
    const now = Date.now();
    const minuteCount = this._getEmailCountInWindow(now, this.minuteWindow);
    const hourCount = this._getEmailCountInWindow(now, this.hourWindow);

    return {
      enabled: this.enabled,
      emailsInLastMinute: minuteCount,
      emailsInLastHour: hourCount,
      maxEmailsPerMinute: this.maxEmailsPerMinute,
      maxEmailsPerHour: this.maxEmailsPerHour,
      canSendImmediately: this.canSendImmediately(),
      waitTime: this._calculateWaitTime(now),
      statistics: { ...this.stats }
    };
  }

  /**
   * Reset rate limiter
   */
  reset() {
    this.emailTimestamps = [];
    this.stats = {
      totalEmails: 0,
      rateLimitedEmails: 0,
      averageWaitTime: 0,
      maxWaitTime: 0
    };
  }

  /**
   * Update rate limit configuration
   * @param {Object} config - New configuration
   */
  updateConfig(config) {
    if (config.enabled !== undefined) {
      this.enabled = config.enabled;
    }
    if (config.maxEmailsPerMinute !== undefined) {
      this.maxEmailsPerMinute = config.maxEmailsPerMinute;
    }
    if (config.maxEmailsPerHour !== undefined) {
      this.maxEmailsPerHour = config.maxEmailsPerHour;
    }
  }

  /**
   * Calculate wait time based on current rate limits
   * @private
   * @param {number} now - Current timestamp
   * @returns {number} Wait time in milliseconds
   */
  _calculateWaitTime(now) {
    const minuteCount = this._getEmailCountInWindow(now, this.minuteWindow);
    const hourCount = this._getEmailCountInWindow(now, this.hourWindow);

    // Check minute limit
    if (minuteCount >= this.maxEmailsPerMinute) {
      const oldestInMinute = this._getOldestTimestampInWindow(now, this.minuteWindow);
      return Math.max(0, oldestInMinute + this.minuteWindow - now);
    }

    // Check hour limit
    if (hourCount >= this.maxEmailsPerHour) {
      const oldestInHour = this._getOldestTimestampInWindow(now, this.hourWindow);
      return Math.max(0, oldestInHour + this.hourWindow - now);
    }

    return 0;
  }

  /**
   * Get email count in time window
   * @private
   * @param {number} now - Current timestamp
   * @param {number} window - Time window in milliseconds
   * @returns {number} Email count
   */
  _getEmailCountInWindow(now, window) {
    const cutoff = now - window;
    return this.emailTimestamps.filter(timestamp => timestamp > cutoff).length;
  }

  /**
   * Get oldest timestamp in time window
   * @private
   * @param {number} now - Current timestamp
   * @param {number} window - Time window in milliseconds
   * @returns {number} Oldest timestamp
   */
  _getOldestTimestampInWindow(now, window) {
    const cutoff = now - window;
    const timestampsInWindow = this.emailTimestamps.filter(timestamp => timestamp > cutoff);
    return timestampsInWindow.length > 0 ? Math.min(...timestampsInWindow) : now;
  }

  /**
   * Clean up old timestamps
   * @private
   * @param {number} now - Current timestamp
   */
  _cleanupOldTimestamps(now) {
    const cutoff = now - this.hourWindow;
    this.emailTimestamps = this.emailTimestamps.filter(timestamp => timestamp > cutoff);
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
   * Get rate limiter statistics
   * @returns {Object} Statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      rateLimitHitPercentage: this.stats.totalEmails > 0 ?
        (this.stats.rateLimitedEmails / this.stats.totalEmails) * 100 : 0,
      currentStatus: this.getStatus()
    };
  }

  /**
   * Create adaptive rate limiter that adjusts based on success/failure rates
   * @param {Object} config - Configuration
   * @returns {AdaptiveRateLimiter} Adaptive rate limiter instance
   */
  static createAdaptive(config = {}) {
    return new AdaptiveRateLimiter(config);
  }

  /**
   * Create burst rate limiter for handling traffic spikes
   * @param {Object} config - Configuration
   * @returns {BurstRateLimiter} Burst rate limiter instance
   */
  static createBurst(config = {}) {
    return new BurstRateLimiter(config);
  }
}

/**
 * Adaptive rate limiter that adjusts limits based on success/failure rates
 */
export class AdaptiveRateLimiter extends RateLimiter {
  constructor(config = {}) {
    super(config);
    this.successRate = 1.0;
    this.adaptationFactor = 0.1;
    this.minLimit = 1;
    this.maxLimit = config.maxEmailsPerMinute * 2;
  }

  /**
   * Record email send result
   * @param {boolean} success - Whether email was sent successfully
   */
  recordResult(success) {
    // Update success rate with exponential moving average
    this.successRate = this.successRate * (1 - this.adaptationFactor) +
                      (success ? 1 : 0) * this.adaptationFactor;

    // Adjust rate limit based on success rate
    if (this.successRate < 0.8) {
      // Decrease rate limit if success rate is low
      this.maxEmailsPerMinute = Math.max(
        this.minLimit,
        Math.floor(this.maxEmailsPerMinute * 0.9)
      );
    } else if (this.successRate > 0.95) {
      // Increase rate limit if success rate is high
      this.maxEmailsPerMinute = Math.min(
        this.maxLimit,
        Math.floor(this.maxEmailsPerMinute * 1.1)
      );
    }
  }

  /**
   * Get adaptive statistics
   * @returns {Object} Statistics including adaptation info
   */
  getAdaptiveStatistics() {
    return {
      ...this.getStatistics(),
      successRate: this.successRate,
      currentLimit: this.maxEmailsPerMinute,
      adaptationActive: this.successRate < 0.8 || this.successRate > 0.95
    };
  }
}

/**
 * Burst rate limiter that allows temporary bursts above normal limits
 */
export class BurstRateLimiter extends RateLimiter {
  constructor(config = {}) {
    super(config);
    this.burstLimit = config.burstLimit || this.maxEmailsPerMinute * 2;
    this.burstWindow = config.burstWindow || 5 * 60 * 1000; // 5 minutes
    this.burstCooldown = config.burstCooldown || 15 * 60 * 1000; // 15 minutes
    this.lastBurst = 0;
  }

  /**
   * Check if burst is available
   * @returns {boolean} True if burst is available
   */
  canBurst() {
    const now = Date.now();
    return (now - this.lastBurst) > this.burstCooldown;
  }

  /**
   * Calculate wait time with burst consideration
   * @private
   * @param {number} now - Current timestamp
   * @returns {number} Wait time in milliseconds
   */
  _calculateWaitTime(now) {
    const minuteCount = this._getEmailCountInWindow(now, this.minuteWindow);
    const hourCount = this._getEmailCountInWindow(now, this.hourWindow);

    // Use burst limit if available
    const effectiveMinuteLimit = this.canBurst() ? this.burstLimit : this.maxEmailsPerMinute;

    // Check minute limit with burst
    if (minuteCount >= effectiveMinuteLimit) {
      const oldestInMinute = this._getOldestTimestampInWindow(now, this.minuteWindow);
      return Math.max(0, oldestInMinute + this.minuteWindow - now);
    }

    // Check hour limit
    if (hourCount >= this.maxEmailsPerHour) {
      const oldestInHour = this._getOldestTimestampInWindow(now, this.hourWindow);
      return Math.max(0, oldestInHour + this.hourWindow - now);
    }

    return 0;
  }

  /**
   * Record burst usage
   */
  recordBurst() {
    this.lastBurst = Date.now();
  }

  /**
   * Get burst status
   * @returns {Object} Burst status information
   */
  getBurstStatus() {
    const now = Date.now();
    return {
      canBurst: this.canBurst(),
      timeUntilNextBurst: Math.max(0, this.burstCooldown - (now - this.lastBurst)),
      burstLimit: this.burstLimit,
      burstWindow: this.burstWindow,
      burstCooldown: this.burstCooldown
    };
  }
}
