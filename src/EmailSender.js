import nodemailer from 'nodemailer';
import { validateEmailConfig, validateEmailContent, validateRecipients } from './config/validation.js';
import { Logger } from './utils/logger.js';
import { RetryLogic } from './utils/retryLogic.js';
import { RateLimiter } from './utils/rateLimiter.js';

/**
 * @typedef {Object} EmailConfig
 * @property {string} service - Email service provider (gmail, outlook, yahoo, custom)
 * @property {Object} auth - Authentication credentials
 * @property {string} auth.user - Email address
 * @property {string} auth.pass - App password or SMTP password
 * @property {string} [host] - SMTP host (for custom)
 * @property {number} [port] - SMTP port (for custom)
 * @property {boolean} [secure] - Use SSL/TLS
 */

/**
 * @typedef {Object} OptionsConfig
 * @property {number} [dailyLimit=100] - Daily email limit
 * @property {number} [delayBetweenEmails=2000] - Delay in milliseconds
 * @property {number} [maxRetries=3] - Maximum retry attempts
 * @property {number} [retryDelay=1000] - Base delay for retries
 * @property {number} [timeout=30000] - Email send timeout
 * @property {boolean} [enableLogging=true] - Enable detailed logging
 * @property {string} [logFile='email-logs.json'] - Log file path
 */

/**
 * @typedef {Object} RateLimitConfig
 * @property {boolean} [enabled=true] - Enable rate limiting
 * @property {number} [maxEmailsPerMinute=10] - Max emails per minute
 * @property {number} [maxEmailsPerHour=100] - Max emails per hour
 */

/**
 * @typedef {Object} SenderConfig
 * @property {EmailConfig} email - Email configuration
 * @property {OptionsConfig} [options] - Options configuration
 * @property {RateLimitConfig} [rateLimit] - Rate limiting configuration
 */

/**
 * @typedef {Object} EmailContent
 * @property {string} subject - Email subject line
 * @property {string} [text] - Plain text version
 * @property {string} [html] - HTML version
 * @property {Array} [attachments] - Array of attachment objects
 * @property {Object} [template] - Template configuration
 * @property {string} template.name - Template name
 * @property {Object} template.variables - Template variables object
 */

/**
 * @typedef {Object} Recipient
 * @property {string} email - Email address
 * @property {string} [name] - Recipient name
 * @property {Object} [customData] - Custom data for personalization
 */

/**
 * @typedef {Object} SendOptions
 * @property {Array} [attachments] - Additional attachments
 * @property {string} [priority] - Email priority (high, normal, low)
 * @property {Object} [headers] - Custom headers
 */

/**
 * @typedef {Object} SendResult
 * @property {boolean} success - Whether the send was successful
 * @property {string} messageId - Email message ID
 * @property {string} recipient - Recipient email
 * @property {number} attempts - Number of attempts made
 * @property {number} duration - Processing duration in ms
 * @property {string} [error] - Error message if failed
 */

/**
 * @typedef {Object} Statistics
 * @property {number} totalSent - Total emails sent successfully
 * @property {number} totalFailed - Total emails failed
 * @property {number} totalAttempts - Total attempts made
 * @property {number} averageDuration - Average processing duration
 * @property {Object} dailyCount - Daily email count
 * @property {Object} errorBreakdown - Error breakdown by type
 */

/**
 * Multi-email sender with retry logic, rate limiting, and comprehensive logging
 */
export class EmailSender {
  /**
   * Create a new EmailSender instance
   * @param {SenderConfig} config - Configuration object
   */
  constructor(config) {
    this.config = this._mergeWithDefaults(config);
    this.transporter = null;
    this.logger = new Logger(this.config.options);
    this.retryLogic = new RetryLogic(this.config.options);
    this.rateLimiter = new RateLimiter(this.config.rateLimit);
    this.statistics = this._initializeStatistics();
    this.dailyCount = 0;
    this.lastResetDate = new Date().toDateString();

    this._validateConfiguration();
    this._initializeTransporter();
  }

  /**
   * Send emails to multiple recipients
   * @param {string[]|Recipient[]} recipients - Array of email addresses or recipient objects
   * @param {EmailContent} emailContent - Email content configuration
   * @param {SendOptions} [options] - Additional send options
   * @returns {Promise<SendResult[]>} Array of send results
   */
  async sendToMultiple(recipients, emailContent, options = {}) {
    this.logger.info('Starting bulk email send', { recipientCount: recipients.length });

    // Validate inputs
    validateRecipients(recipients);
    validateEmailContent(emailContent);

    // Check daily limit
    this._checkDailyLimit();

    const results = [];
    const normalizedRecipients = this._normalizeRecipients(recipients);

    for (const recipient of normalizedRecipients) {
      try {
        // Apply rate limiting
        await this.rateLimiter.waitIfNeeded();

        const result = await this._sendToSingleRecipient(recipient, emailContent, options);
        results.push(result);

        // Update statistics
        this._updateStatistics(result);

        // Add delay between emails
        if (this.config.options.delayBetweenEmails > 0) {
          await this._delay(this.config.options.delayBetweenEmails);
        }

      } catch (error) {
        this.logger.error('Failed to send email', {
          recipient: recipient.email,
          error: error.message
        });

        results.push({
          success: false,
          recipient: recipient.email,
          attempts: 1,
          duration: 0,
          error: error.message
        });
      }
    }

    this.logger.info('Bulk email send completed', {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });

    return results;
  }

  /**
   * Send email to a single recipient
   * @param {string|Recipient} recipient - Email address or recipient object
   * @param {EmailContent} emailContent - Email content configuration
   * @param {SendOptions} [options] - Additional send options
   * @returns {Promise<SendResult>} Send result
   */
  async sendSingle(recipient, emailContent, options = {}) {
    const normalizedRecipient = this._normalizeRecipients([recipient])[0];
    return this._sendToSingleRecipient(normalizedRecipient, emailContent, options);
  }

  /**
   * Get sending logs
   * @returns {Array} Array of log entries
   */
  getLogs() {
    return this.logger.getLogs();
  }

  /**
   * Get sending statistics
   * @returns {Statistics} Statistics object
   */
  getStatistics() {
    return { ...this.statistics };
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logger.clearLogs();
  }

  /**
   * Validate email configuration
   * @returns {boolean} True if configuration is valid
   */
  validateConfiguration() {
    try {
      this._validateConfiguration();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Merge configuration with defaults
   * @private
   * @param {SenderConfig} config - User configuration
   * @returns {SenderConfig} Merged configuration
   */
  _mergeWithDefaults(config) {
    const defaults = {
      options: {
        dailyLimit: 100,
        delayBetweenEmails: 2000,
        maxRetries: 3,
        retryDelay: 1000,
        timeout: 30000,
        enableLogging: true,
        logFile: 'email-logs.json'
      },
      rateLimit: {
        enabled: true,
        maxEmailsPerMinute: 10,
        maxEmailsPerHour: 100
      }
    };

    return {
      email: config.email,
      options: { ...defaults.options, ...config.options },
      rateLimit: { ...defaults.rateLimit, ...config.rateLimit }
    };
  }

  /**
   * Validate configuration
   * @private
   */
  _validateConfiguration() {
    validateEmailConfig(this.config.email);
  }

  /**
   * Initialize nodemailer transporter
   * @private
   */
  _initializeTransporter() {
    this.transporter = nodemailer.createTransporter({
      service: this.config.email.service,
      auth: this.config.email.auth,
      host: this.config.email.host,
      port: this.config.email.port,
      secure: this.config.email.secure,
      connectionTimeout: this.config.options.timeout,
      greetingTimeout: this.config.options.timeout,
      socketTimeout: this.config.options.timeout
    });
  }

  /**
   * Initialize statistics object
   * @private
   * @returns {Statistics} Initial statistics
   */
  _initializeStatistics() {
    return {
      totalSent: 0,
      totalFailed: 0,
      totalAttempts: 0,
      averageDuration: 0,
      dailyCount: {},
      errorBreakdown: {}
    };
  }

  /**
   * Check daily email limit
   * @private
   */
  _checkDailyLimit() {
    const today = new Date().toDateString();

    if (today !== this.lastResetDate) {
      this.dailyCount = 0;
      this.lastResetDate = today;
    }

    if (this.dailyCount >= this.config.options.dailyLimit) {
      throw new Error(`Daily email limit of ${this.config.options.dailyLimit} reached`);
    }
  }

  /**
   * Normalize recipients to consistent format
   * @private
   * @param {string[]|Recipient[]} recipients - Recipients to normalize
   * @returns {Recipient[]} Normalized recipients
   */
  _normalizeRecipients(recipients) {
    return recipients.map(recipient => {
      if (typeof recipient === 'string') {
        return { email: recipient };
      }
      return recipient;
    });
  }

  /**
   * Send email to a single recipient with retry logic
   * @private
   * @param {Recipient} recipient - Recipient object
   * @param {EmailContent} emailContent - Email content
   * @param {SendOptions} options - Send options
   * @returns {Promise<SendResult>} Send result
   */
  async _sendToSingleRecipient(recipient, emailContent, options) {
    const startTime = Date.now();
    let attempts = 0;

    const sendEmail = async () => {
      attempts++;
      this.dailyCount++;

      const mailOptions = this._buildMailOptions(recipient, emailContent, options);

      this.logger.debug('Sending email', {
        recipient: recipient.email,
        attempt: attempts
      });

      const info = await this.transporter.sendMail(mailOptions);

      const duration = Date.now() - startTime;

      this.logger.info('Email sent successfully', {
        recipient: recipient.email,
        messageId: info.messageId,
        attempts,
        duration
      });

      return {
        success: true,
        messageId: info.messageId,
        recipient: recipient.email,
        attempts,
        duration
      };
    };

    try {
      return await this.retryLogic.executeWithRetry(sendEmail);
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error('Email send failed after all retries', {
        recipient: recipient.email,
        attempts,
        duration,
        error: error.message
      });

      return {
        success: false,
        recipient: recipient.email,
        attempts,
        duration,
        error: error.message
      };
    }
  }

  /**
   * Build mail options for nodemailer
   * @private
   * @param {Recipient} recipient - Recipient object
   * @param {EmailContent} emailContent - Email content
   * @param {SendOptions} options - Send options
   * @returns {Object} Mail options
   */
  _buildMailOptions(recipient, emailContent, options) {
    let { subject } = emailContent;
    let { text } = emailContent;
    let { html } = emailContent;

    // Apply template variables if template is provided
    if (emailContent.template) {
      const variables = { ...emailContent.template.variables, ...recipient.customData };
      subject = this._applyTemplate(subject, variables);
      text = text ? this._applyTemplate(text, variables) : text;
      html = html ? this._applyTemplate(html, variables) : html;
    }

    const mailOptions = {
      from: this.config.email.auth.user,
      to: recipient.email,
      subject,
      text,
      html,
      attachments: [...(emailContent.attachments || []), ...(options.attachments || [])],
      headers: options.headers || {}
    };

    if (options.priority) {
      mailOptions.headers['X-Priority'] = options.priority;
    }

    return mailOptions;
  }

  /**
   * Apply template variables to content
   * @private
   * @param {string} content - Content to process
   * @param {Object} variables - Variables to substitute
   * @returns {string} Processed content
   */
  _applyTemplate(content, variables) {
    return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  /**
   * Update statistics
   * @private
   * @param {SendResult} result - Send result
   */
  _updateStatistics(result) {
    this.statistics.totalAttempts += result.attempts;

    if (result.success) {
      this.statistics.totalSent++;
    } else {
      this.statistics.totalFailed++;

      // Update error breakdown
      const errorType = this._categorizeError(result.error);
      this.statistics.errorBreakdown[errorType] =
        (this.statistics.errorBreakdown[errorType] || 0) + 1;
    }

    // Update average duration
    const totalProcessed = this.statistics.totalSent + this.statistics.totalFailed;
    this.statistics.averageDuration =
      (this.statistics.averageDuration * (totalProcessed - 1) + result.duration) / totalProcessed;

    // Update daily count
    const today = new Date().toDateString();
    this.statistics.dailyCount[today] = (this.statistics.dailyCount[today] || 0) + 1;
  }

  /**
   * Categorize error for statistics
   * @private
   * @param {string} error - Error message
   * @returns {string} Error category
   */
  _categorizeError(error) {
    if (error.includes('authentication') || error.includes('auth')) {
      return 'authentication';
    } else if (error.includes('network') || error.includes('timeout')) {
      return 'network';
    } else if (error.includes('SMTP') || error.includes('smtp')) {
      return 'smtp';
    } else if (error.includes('validation') || error.includes('invalid')) {
      return 'validation';
    } else if (error.includes('rate') || error.includes('limit')) {
      return 'rate_limit';
    }
    return 'other';
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
}
