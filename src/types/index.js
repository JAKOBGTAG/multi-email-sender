/**
 * @fileoverview Type definitions for the multi-email sender package
 * @author Pratham Mahajan
 * @version 1.0.0
 */

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
 * @property {Array<Attachment>} [attachments] - Array of attachment objects
 * @property {TemplateConfig} [template] - Template configuration
 */

/**
 * @typedef {Object} Attachment
 * @property {string} filename - Attachment filename
 * @property {string} path - Path to attachment file
 * @property {string} [contentType] - MIME type
 * @property {string} [cid] - Content ID for inline attachments
 */

/**
 * @typedef {Object} TemplateConfig
 * @property {string} name - Template name
 * @property {Object} variables - Template variables object
 */

/**
 * @typedef {Object} Recipient
 * @property {string} email - Email address
 * @property {string} [name] - Recipient name
 * @property {Object} [customData] - Custom data for personalization
 */

/**
 * @typedef {Object} SendOptions
 * @property {Array<Attachment>} [attachments] - Additional attachments
 * @property {string} [priority] - Email priority (high, normal, low)
 * @property {Object} [headers] - Custom headers
 */

/**
 * @typedef {Object} SendResult
 * @property {boolean} success - Whether the send was successful
 * @property {string} [messageId] - Email message ID
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
 * @property {Object<string, number>} dailyCount - Daily email count
 * @property {Object<string, number>} errorBreakdown - Error breakdown by type
 */

/**
 * @typedef {Object} LogEntry
 * @property {string} timestamp - ISO 8601 timestamp
 * @property {string} level - Log level (DEBUG, INFO, WARN, ERROR, FATAL)
 * @property {string} message - Log message
 * @property {string} [recipient] - Email recipient
 * @property {string} [messageId] - Email message ID
 * @property {number} [attempts] - Number of attempts
 * @property {number} [duration] - Processing duration
 * @property {string} [error] - Error message
 */

/**
 * @typedef {Object} RetryPolicy
 * @property {number} maxRetries - Maximum retry attempts
 * @property {number} baseDelay - Base delay for retries
 * @property {number} maxDelay - Maximum delay
 * @property {number} backoffMultiplier - Exponential backoff multiplier
 * @property {number} jitterFactor - Jitter factor for randomization
 */

/**
 * @typedef {Object} RateLimitStatus
 * @property {boolean} enabled - Whether rate limiting is enabled
 * @property {number} emailsInLastMinute - Emails sent in last minute
 * @property {number} emailsInLastHour - Emails sent in last hour
 * @property {number} maxEmailsPerMinute - Maximum emails per minute
 * @property {number} maxEmailsPerHour - Maximum emails per hour
 * @property {boolean} canSendImmediately - Whether email can be sent immediately
 * @property {number} waitTime - Wait time in milliseconds
 * @property {Object} statistics - Rate limiter statistics
 */

/**
 * @typedef {Object} EmailServiceConfig
 * @property {string} service - Email service provider
 * @property {Object} auth - Authentication credentials
 * @property {string} [host] - SMTP host
 * @property {number} [port] - SMTP port
 * @property {boolean} [secure] - Use SSL/TLS
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {Array<string>} usedVariables - Variables used in template
 * @property {Array<string>} missingVariables - Missing variables
 * @property {Array<string>} unusedVariables - Unused variables
 */

/**
 * @typedef {Object} LogStatistics
 * @property {number} total - Total log entries
 * @property {Object<string, number>} byLevel - Log count by level
 * @property {Object<string, number>} byRecipient - Log count by recipient
 * @property {number} errors - Number of error logs
 * @property {number} warnings - Number of warning logs
 * @property {Object} timeRange - Time range of logs
 */

/**
 * @typedef {Object} RetryStatistics
 * @property {number} totalAttempts - Total attempts made
 * @property {number} successfulOnFirstTry - Successful on first try
 * @property {number} successfulAfterRetry - Successful after retry
 * @property {number} failedAfterAllRetries - Failed after all retries
 * @property {number} averageAttempts - Average attempts per email
 * @property {Object<number, number>} retryDistribution - Distribution of retry counts
 */

/**
 * @typedef {Object} BurstStatus
 * @property {boolean} canBurst - Whether burst is available
 * @property {number} timeUntilNextBurst - Time until next burst in ms
 * @property {number} burstLimit - Burst limit
 * @property {number} burstWindow - Burst window in ms
 * @property {number} burstCooldown - Burst cooldown in ms
 */

/**
 * @typedef {Object} AdaptiveStatistics
 * @property {number} successRate - Current success rate
 * @property {number} currentLimit - Current rate limit
 * @property {boolean} adaptationActive - Whether adaptation is active
 */

/**
 * @typedef {Object} EmailServiceRecommendations
 * @property {number} dailyLimit - Recommended daily limit
 * @property {number} delayBetweenEmails - Recommended delay
 * @property {number} maxEmailsPerMinute - Recommended minute limit
 * @property {number} maxEmailsPerHour - Recommended hour limit
 * @property {string} note - Additional notes
 */

// Export all types for external use
export default {
  EmailConfig: 'EmailConfig',
  OptionsConfig: 'OptionsConfig',
  RateLimitConfig: 'RateLimitConfig',
  SenderConfig: 'SenderConfig',
  EmailContent: 'EmailContent',
  Attachment: 'Attachment',
  TemplateConfig: 'TemplateConfig',
  Recipient: 'Recipient',
  SendOptions: 'SendOptions',
  SendResult: 'SendResult',
  Statistics: 'Statistics',
  LogEntry: 'LogEntry',
  RetryPolicy: 'RetryPolicy',
  RateLimitStatus: 'RateLimitStatus',
  EmailServiceConfig: 'EmailServiceConfig',
  ValidationResult: 'ValidationResult',
  LogStatistics: 'LogStatistics',
  RetryStatistics: 'RetryStatistics',
  BurstStatus: 'BurstStatus',
  AdaptiveStatistics: 'AdaptiveStatistics',
  EmailServiceRecommendations: 'EmailServiceRecommendations'
};
