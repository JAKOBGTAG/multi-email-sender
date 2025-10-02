/**
 * Email configuration management utilities
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
 * Predefined email service configurations
 */
export const EMAIL_SERVICES = {
  gmail: {
    service: 'gmail',
    port: 587,
    secure: false
  },
  outlook: {
    service: 'hotmail',
    port: 587,
    secure: false
  },
  yahoo: {
    service: 'yahoo',
    port: 587,
    secure: false
  },
  custom: {
    service: 'custom'
  }
};

/**
 * Get email service configuration
 * @param {string} serviceName - Name of the email service
 * @returns {EmailServiceConfig} Service configuration
 */
export function getEmailServiceConfig(serviceName) {
  const service = EMAIL_SERVICES[serviceName.toLowerCase()];
  if (!service) {
    throw new Error(`Unsupported email service: ${serviceName}`);
  }
  return { ...service };
}

/**
 * Create email configuration from environment variables
 * @returns {EmailServiceConfig} Email configuration
 */
export function createConfigFromEnv() {
  const service = process.env.EMAIL_SERVICE || 'gmail';
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error('EMAIL_USER and EMAIL_PASS environment variables are required');
  }

  const config = getEmailServiceConfig(service);

  return {
    ...config,
    auth: {
      user,
      pass
    },
    host: process.env.EMAIL_HOST || config.host,
    port: parseInt(process.env.EMAIL_PORT, 10) || config.port,
    secure: process.env.EMAIL_SECURE === 'true' || config.secure
  };
}

/**
 * Validate email service configuration
 * @param {EmailServiceConfig} config - Configuration to validate
 * @returns {boolean} True if valid
 */
export function validateEmailServiceConfig(config) {
  if (!config.service) {
    throw new Error('Email service is required');
  }

  if (!config.auth || !config.auth.user || !config.auth.pass) {
    throw new Error('Email authentication credentials are required');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(config.auth.user)) {
    throw new Error('Invalid email address format');
  }

  // For custom service, host and port are required
  if (config.service === 'custom') {
    if (!config.host || !config.port) {
      throw new Error('Host and port are required for custom email service');
    }
  }

  return true;
}

/**
 * Get recommended settings for different email providers
 * @param {string} serviceName - Email service name
 * @returns {Object} Recommended settings
 */
export function getRecommendedSettings(serviceName) {
  const recommendations = {
    gmail: {
      dailyLimit: 100,
      delayBetweenEmails: 2000,
      maxEmailsPerMinute: 10,
      maxEmailsPerHour: 100,
      note: 'Gmail has strict rate limits. Use app passwords for authentication.'
    },
    outlook: {
      dailyLimit: 300,
      delayBetweenEmails: 1000,
      maxEmailsPerMinute: 20,
      maxEmailsPerHour: 200,
      note: 'Outlook allows higher sending limits but still has restrictions.'
    },
    yahoo: {
      dailyLimit: 100,
      delayBetweenEmails: 2000,
      maxEmailsPerMinute: 10,
      maxEmailsPerHour: 100,
      note: 'Yahoo has similar limits to Gmail. Use app passwords.'
    },
    custom: {
      dailyLimit: 500,
      delayBetweenEmails: 500,
      maxEmailsPerMinute: 30,
      maxEmailsPerHour: 500,
      note: 'Custom SMTP settings depend on your provider. Check their documentation.'
    }
  };

  return recommendations[serviceName.toLowerCase()] || recommendations.custom;
}
