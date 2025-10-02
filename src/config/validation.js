/**
 * Input validation utilities
 */

/**
 * Validate email configuration
 * @param {Object} emailConfig - Email configuration object
 * @throws {Error} If configuration is invalid
 */
export function validateEmailConfig(emailConfig) {
  if (!emailConfig) {
    throw new Error('Email configuration is required');
  }

  if (!emailConfig.service) {
    throw new Error('Email service is required');
  }

  if (!emailConfig.auth) {
    throw new Error('Email authentication is required');
  }

  if (!emailConfig.auth.user) {
    throw new Error('Email user is required');
  }

  if (!emailConfig.auth.pass) {
    throw new Error('Email password is required');
  }

  // Validate email format
  if (!isValidEmail(emailConfig.auth.user)) {
    throw new Error('Invalid email address format');
  }

  // For custom service, validate host and port
  if (emailConfig.service === 'custom') {
    if (!emailConfig.host) {
      throw new Error('SMTP host is required for custom service');
    }
    if (!emailConfig.port || typeof emailConfig.port !== 'number') {
      throw new Error('Valid SMTP port is required for custom service');
    }
  }
}

/**
 * Validate email content
 * @param {Object} emailContent - Email content object
 * @throws {Error} If content is invalid
 */
export function validateEmailContent(emailContent) {
  if (!emailContent) {
    throw new Error('Email content is required');
  }

  if (!emailContent.subject || typeof emailContent.subject !== 'string') {
    throw new Error('Email subject is required and must be a string');
  }

  if (!emailContent.text && !emailContent.html) {
    throw new Error('Either text or HTML content is required');
  }

  if (emailContent.text && typeof emailContent.text !== 'string') {
    throw new Error('Text content must be a string');
  }

  if (emailContent.html && typeof emailContent.html !== 'string') {
    throw new Error('HTML content must be a string');
  }

  // Validate attachments if provided
  if (emailContent.attachments) {
    if (!Array.isArray(emailContent.attachments)) {
      throw new Error('Attachments must be an array');
    }

    emailContent.attachments.forEach((attachment, index) => {
      if (!attachment.filename || !attachment.path) {
        throw new Error(`Attachment at index ${index} must have filename and path`);
      }
    });
  }

  // Validate template if provided
  if (emailContent.template) {
    if (!emailContent.template.name || typeof emailContent.template.name !== 'string') {
      throw new Error('Template name is required and must be a string');
    }

    if (emailContent.template.variables && typeof emailContent.template.variables !== 'object') {
      throw new Error('Template variables must be an object');
    }
  }
}

/**
 * Validate recipients
 * @param {Array} recipients - Array of recipients
 * @throws {Error} If recipients are invalid
 */
export function validateRecipients(recipients) {
  if (!Array.isArray(recipients)) {
    throw new Error('Recipients must be an array');
  }

  if (recipients.length === 0) {
    throw new Error('At least one recipient is required');
  }

  recipients.forEach((recipient, index) => {
    if (typeof recipient === 'string') {
      if (!isValidEmail(recipient)) {
        throw new Error(`Invalid email address at index ${index}: ${recipient}`);
      }
    } else if (typeof recipient === 'object') {
      if (!recipient.email || typeof recipient.email !== 'string') {
        throw new Error(`Recipient at index ${index} must have a valid email property`);
      }

      if (!isValidEmail(recipient.email)) {
        throw new Error(`Invalid email address at index ${index}: ${recipient.email}`);
      }

      if (recipient.name && typeof recipient.name !== 'string') {
        throw new Error(`Recipient name at index ${index} must be a string`);
      }

      if (recipient.customData && typeof recipient.customData !== 'object') {
        throw new Error(`Recipient customData at index ${index} must be an object`);
      }
    } else {
      throw new Error(`Invalid recipient type at index ${index}. Must be string or object.`);
    }
  });
}

/**
 * Validate send options
 * @param {Object} options - Send options object
 * @throws {Error} If options are invalid
 */
export function validateSendOptions(options) {
  if (!options) {
    return; // Options are optional
  }

  if (options.attachments) {
    if (!Array.isArray(options.attachments)) {
      throw new Error('Attachments must be an array');
    }

    options.attachments.forEach((attachment, index) => {
      if (!attachment.filename || !attachment.path) {
        throw new Error(`Attachment at index ${index} must have filename and path`);
      }
    });
  }

  if (options.priority) {
    const validPriorities = ['high', 'normal', 'low'];
    if (!validPriorities.includes(options.priority)) {
      throw new Error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
    }
  }

  if (options.headers && typeof options.headers !== 'object') {
    throw new Error('Headers must be an object');
  }
}

/**
 * Validate configuration options
 * @param {Object} options - Configuration options
 * @throws {Error} If options are invalid
 */
export function validateConfigOptions(options) {
  if (!options) {
    return; // Options are optional
  }

  if (options.dailyLimit !== undefined) {
    if (typeof options.dailyLimit !== 'number' || options.dailyLimit <= 0) {
      throw new Error('Daily limit must be a positive number');
    }
  }

  if (options.delayBetweenEmails !== undefined) {
    if (typeof options.delayBetweenEmails !== 'number' || options.delayBetweenEmails < 0) {
      throw new Error('Delay between emails must be a non-negative number');
    }
  }

  if (options.maxRetries !== undefined) {
    if (typeof options.maxRetries !== 'number' || options.maxRetries < 0) {
      throw new Error('Max retries must be a non-negative number');
    }
  }

  if (options.retryDelay !== undefined) {
    if (typeof options.retryDelay !== 'number' || options.retryDelay < 0) {
      throw new Error('Retry delay must be a non-negative number');
    }
  }

  if (options.timeout !== undefined) {
    if (typeof options.timeout !== 'number' || options.timeout <= 0) {
      throw new Error('Timeout must be a positive number');
    }
  }

  if (options.enableLogging !== undefined && typeof options.enableLogging !== 'boolean') {
    throw new Error('Enable logging must be a boolean');
  }

  if (options.logFile !== undefined) {
    if (typeof options.logFile !== 'string' || options.logFile.trim() === '') {
      throw new Error('Log file must be a non-empty string');
    }
  }
}

/**
 * Validate rate limit configuration
 * @param {Object} rateLimit - Rate limit configuration
 * @throws {Error} If rate limit configuration is invalid
 */
export function validateRateLimitConfig(rateLimit) {
  if (!rateLimit) {
    return; // Rate limit is optional
  }

  if (rateLimit.enabled !== undefined && typeof rateLimit.enabled !== 'boolean') {
    throw new Error('Rate limit enabled must be a boolean');
  }

  if (rateLimit.maxEmailsPerMinute !== undefined) {
    if (typeof rateLimit.maxEmailsPerMinute !== 'number' || rateLimit.maxEmailsPerMinute <= 0) {
      throw new Error('Max emails per minute must be a positive number');
    }
  }

  if (rateLimit.maxEmailsPerHour !== undefined) {
    if (typeof rateLimit.maxEmailsPerHour !== 'number' || rateLimit.maxEmailsPerHour <= 0) {
      throw new Error('Max emails per hour must be a positive number');
    }
  }

  // Validate that hourly limit is not less than minute limit
  if (rateLimit.maxEmailsPerMinute && rateLimit.maxEmailsPerHour) {
    if (rateLimit.maxEmailsPerHour < rateLimit.maxEmailsPerMinute) {
      throw new Error('Hourly limit cannot be less than minute limit');
    }
  }
}

/**
 * Check if email address is valid
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 */
export function isValidEmail(email) {
  if (typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize email address
 * @param {string} email - Email address to sanitize
 * @returns {string} Sanitized email address
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') {
    return '';
  }

  return email.trim().toLowerCase();
}

/**
 * Validate template variables
 * @param {string} content - Content with template variables
 * @param {Object} variables - Variables object
 * @returns {Object} Validation result
 */
export function validateTemplateVariables(content, variables) {
  const templateRegex = /\{\{(\w+)\}\}/g;
  const usedVariables = new Set();
  const missingVariables = new Set();
  let match;

  while ((match = templateRegex.exec(content)) !== null) {
    const variableName = match[1];
    usedVariables.add(variableName);

    if (!variables || !Object.prototype.hasOwnProperty.call(variables, variableName)) {
      missingVariables.add(variableName);
    }
  }

  return {
    isValid: missingVariables.size === 0,
    usedVariables: Array.from(usedVariables),
    missingVariables: Array.from(missingVariables),
    unusedVariables: Object.keys(variables || {}).filter(key => !usedVariables.has(key))
  };
}
