/**
 * @fileoverview Multi-email sender package entry point
 * @author Pratham Mahajan
 * @version 1.0.0
 */

export { EmailSender } from './EmailSender.js';
export { Logger, LOG_LEVELS } from './utils/logger.js';
export { RetryLogic } from './utils/retryLogic.js';
export { RateLimiter, AdaptiveRateLimiter, BurstRateLimiter } from './utils/rateLimiter.js';
export {
  validateEmailConfig,
  validateEmailContent,
  validateRecipients,
  validateSendOptions,
  validateConfigOptions,
  validateRateLimitConfig,
  isValidEmail,
  sanitizeEmail,
  validateTemplateVariables
} from './config/validation.js';
export {
  EMAIL_SERVICES,
  getEmailServiceConfig,
  createConfigFromEnv,
  validateEmailServiceConfig,
  getRecommendedSettings
} from './config/emailConfig.js';

// Re-export commonly used types for JSDoc
export { default as types } from './types/index.js';
