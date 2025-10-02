# 🚀 Multi Email Sender

<div align="center">

**The Ultimate Node.js Email Automation Solution**

[![npm version](https://badge.fury.io/js/@prathammahajan%2Fmulti-email-sender.svg)](https://badge.fury.io/js/@prathammahajan%2Fmulti-email-sender)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org/)
[![Downloads](https://img.shields.io/npm/dm/@prathammahajan/multi-email-sender.svg)](https://www.npmjs.com/package/@prathammahajan/multi-email-sender)

[![GitHub stars](https://img.shields.io/github/stars/prathammahajan13/multi-email-sender.svg?style=social&label=Star)](https://github.com/prathammahajan13/multi-email-sender)
[![GitHub forks](https://img.shields.io/github/forks/prathammahajan13/multi-email-sender.svg?style=social&label=Fork)](https://github.com/prathammahajan13/multi-email-sender/fork)
[![GitHub watchers](https://img.shields.io/github/watchers/prathammahajan13/multi-email-sender.svg?style=social&label=Watch)](https://github.com/prathammahajan13/multi-email-sender)

</div>

---

## 🎯 **What Makes This Special?**

Transform your email operations with our **enterprise-grade** solution that combines **intelligent automation**, **smart analytics**, and **bulletproof reliability**. Whether you're sending 10 emails or 10,000, we've got you covered! 

### 🌟 **Why Developers Love Us**

- 🧠 **Smart Retry Logic** - Never lose an email again with intelligent exponential backoff
- ⚡ **Adaptive Rate Limiting** - Automatically adjusts to your email provider's limits
- 📊 **Real-time Analytics** - Track success rates, performance metrics, and delivery insights
- 🎨 **Template Engine** - Create personalized emails with dynamic content
- 🛡️ **Enterprise Security** - Built with production-grade error handling and validation
- 📈 **Scalable Architecture** - Handles everything from startups to enterprise workloads

---

## 🚀 **Quick Start** (30 seconds)

```bash
npm install @prathammahajan/multi-email-sender
```

```javascript
import { EmailSender } from '@prathammahajan/multi-email-sender';

// 🎯 Initialize with your email provider
const sender = new EmailSender({
  email: {
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-app-password' // Use app password for Gmail
    }
  }
});

// 📧 Send to multiple recipients instantly
const results = await sender.sendToMultiple(
  ['user1@example.com', 'user2@example.com'],
  {
    subject: '🎉 Welcome to Our Platform!',
    html: '<h1>Hello there!</h1><p>Thanks for joining us!</p>'
  }
);

console.log(`✅ Sent ${results.filter(r => r.success).length} emails successfully!`);
```

**That's it!** Your emails are sent with automatic retry logic, rate limiting, and comprehensive logging. 🎉

---

## 🎨 **Interactive Features Showcase**

### 🧠 **Smart Retry Logic**
```javascript
// Automatically retries failed emails with exponential backoff
const sender = new EmailSender({
  options: {
    maxRetries: 5,        // Try up to 5 times
    retryDelay: 1000,     // Start with 1 second delay
    enableLogging: true   // Track every attempt
  }
});
```

### ⚡ **Adaptive Rate Limiting**
```javascript
// Automatically adjusts to your provider's limits
const sender = new EmailSender({
  rateLimit: {
    enabled: true,
    maxEmailsPerMinute: 10,  // Gmail-friendly
    maxEmailsPerHour: 100    // Respectful limits
  }
});
```

### 🎨 **Dynamic Templates**
```javascript
// Create personalized emails with ease
const recipients = [
  { email: 'john@example.com', name: 'John', company: 'Tech Corp' },
  { email: 'jane@example.com', name: 'Jane', company: 'Design Studio' }
];

const emailContent = {
  subject: 'Hello {{name}} from {{company}}!',
  html: `
    <h1>Welcome {{name}}!</h1>
    <p>We're excited to have you from <strong>{{company}}</strong> join our community.</p>
    <p>Best regards,<br>The Team</p>
  `,
  template: {
    name: 'welcome',
    variables: { name: '{{name}}', company: '{{company}}' }
  }
};

await sender.sendToMultiple(recipients, emailContent);
```

### 📊 **Real-time Analytics**
```javascript
// Get comprehensive insights
const stats = sender.getStatistics();
console.log(`
📈 Email Analytics:
✅ Success Rate: ${((stats.totalSent / (stats.totalSent + stats.totalFailed)) * 100).toFixed(1)}%
📧 Total Sent: ${stats.totalSent}
⏱️  Avg Duration: ${Math.round(stats.averageDuration)}ms
🔄 Total Attempts: ${stats.totalAttempts}
`);
```

---

## 🛠️ **Configuration Made Simple**

### 📧 **Email Provider Setup**

<details>
<summary><strong>🔵 Gmail Configuration</strong> (Click to expand)</summary>

```javascript
const gmailSender = new EmailSender({
  email: {
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-app-password' // Generate in Google Account settings
    }
  },
  options: {
    dailyLimit: 100,           // Gmail's recommended limit
    delayBetweenEmails: 2000,  // 2 seconds between emails
    maxRetries: 3
  },
  rateLimit: {
    maxEmailsPerMinute: 10,
    maxEmailsPerHour: 100
  }
});
```

**💡 Pro Tip:** Enable 2-factor authentication and use app passwords for better security!
</details>

<details>
<summary><strong>🟠 Outlook Configuration</strong> (Click to expand)</summary>

```javascript
const outlookSender = new EmailSender({
  email: {
    service: 'hotmail',
    auth: {
      user: 'your-email@outlook.com',
      pass: 'your-password'
    }
  },
  options: {
    dailyLimit: 300,           // Outlook allows more
    delayBetweenEmails: 1000,  // Faster sending
    maxRetries: 3
  },
  rateLimit: {
    maxEmailsPerMinute: 20,
    maxEmailsPerHour: 200
  }
});
```
</details>

<details>
<summary><strong>🟢 Custom SMTP Configuration</strong> (Click to expand)</summary>

```javascript
const customSender = new EmailSender({
  email: {
    service: 'custom',
    auth: {
      user: 'your-email@yourdomain.com',
      pass: 'your-smtp-password'
    },
    host: 'smtp.yourdomain.com',
    port: 587,
    secure: false
  },
  options: {
    dailyLimit: 500,           // Check with your provider
    delayBetweenEmails: 500,   // Custom providers often allow faster sending
    maxRetries: 5
  },
  rateLimit: {
    maxEmailsPerMinute: 30,
    maxEmailsPerHour: 500
  }
});
```
</details>

---

## 🎯 **Real-World Use Cases**

### 🛒 **E-commerce Order Confirmations**
```javascript
// Send personalized order confirmations
const orderEmails = orders.map(order => ({
  email: order.customerEmail,
  name: order.customerName,
  orderId: order.id,
  total: order.total,
  items: order.items
}));

const emailContent = {
  subject: '🎉 Order Confirmation #{{orderId}}',
  html: `
    <h1>Thank you {{name}}!</h1>
    <p>Your order #{{orderId}} has been confirmed.</p>
    <p><strong>Total: ${{total}}</strong></p>
    <p>We'll send you tracking information soon!</p>
  `,
  template: {
    name: 'order-confirmation',
    variables: { name: '{{name}}', orderId: '{{orderId}}', total: '{{total}}' }
  }
};

await sender.sendToMultiple(orderEmails, emailContent);
```

### 📧 **Newsletter Campaigns**
```javascript
// Send newsletters with attachments
const newsletterContent = {
  subject: '📰 Weekly Newsletter - {{date}}',
  html: newsletterHTML,
  attachments: [
    { filename: 'newsletter.pdf', path: './newsletters/weekly.pdf' }
  ],
  template: {
    name: 'newsletter',
    variables: { date: new Date().toLocaleDateString() }
  }
};

// Process in batches for large lists
const batchSize = 50;
for (let i = 0; i < subscribers.length; i += batchSize) {
  const batch = subscribers.slice(i, i + batchSize);
  await sender.sendToMultiple(batch, newsletterContent);
  
  // Add delay between batches
  await new Promise(resolve => setTimeout(resolve, 5000));
}
```

### 🔔 **Transactional Notifications**
```javascript
// Send system notifications
const notifications = [
  { email: 'admin@company.com', type: 'system', message: 'Server backup completed' },
  { email: 'user@example.com', type: 'account', message: 'Password changed successfully' }
];

for (const notification of notifications) {
  const emailContent = {
    subject: `🔔 ${notification.type.charAt(0).toUpperCase() + notification.type.slice(1)} Notification`,
    text: notification.message,
    priority: 'high'
  };
  
  await sender.sendSingle(notification.email, emailContent);
}
```

---

## 📊 **Advanced Features**

### 🧠 **Intelligent Error Handling**
```javascript
// Automatic error categorization and handling
const results = await sender.sendToMultiple(recipients, emailContent);

results.forEach(result => {
  if (!result.success) {
    switch (result.error) {
      case 'authentication':
        console.log('🔐 Auth issue - check credentials');
        break;
      case 'rate_limit':
        console.log('⏱️ Rate limited - will retry automatically');
        break;
      case 'network':
        console.log('🌐 Network issue - retrying with backoff');
        break;
      default:
        console.log('❌ Other error:', result.error);
    }
  }
});
```

### 📈 **Performance Monitoring**
```javascript
// Get detailed performance insights
const stats = sender.getStatistics();
const logs = sender.getLogs();

console.log(`
📊 Performance Report:
┌─────────────────────────────────────┐
│ 📧 Emails Sent: ${stats.totalSent.toString().padEnd(20)} │
│ ❌ Failed: ${stats.totalFailed.toString().padEnd(23)} │
│ ⏱️  Avg Time: ${Math.round(stats.averageDuration).toString().padEnd(18)}ms │
│ 🔄 Total Attempts: ${stats.totalAttempts.toString().padEnd(15)} │
└─────────────────────────────────────┘

📈 Success Rate: ${((stats.totalSent / (stats.totalSent + stats.totalFailed)) * 100).toFixed(1)}%
🎯 Error Breakdown:`, stats.errorBreakdown);
```

### 🔄 **Batch Processing with Progress**
```javascript
// Process large lists with progress tracking
const processLargeList = async (recipients, emailContent) => {
  const batchSize = 100;
  const totalBatches = Math.ceil(recipients.length / batchSize);
  
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batchNumber = Math.floor(i / batchSize) + 1;
    const batch = recipients.slice(i, i + batchSize);
    
    console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} recipients)...`);
    
    const results = await sender.sendToMultiple(batch, emailContent);
    const successful = results.filter(r => r.success).length;
    
    console.log(`✅ Batch ${batchNumber} completed: ${successful}/${batch.length} successful`);
    
    // Show progress bar
    const progress = Math.round((batchNumber / totalBatches) * 100);
    console.log(`📊 Progress: [${'█'.repeat(progress/5)}${'░'.repeat(20-progress/5)}] ${progress}%`);
    
    // Rate limiting delay
    if (batchNumber < totalBatches) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};
```

---

## 🌍 **Environment Variables** (Production Ready)

```bash
# .env file
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_DAILY_LIMIT=100
EMAIL_DELAY=2000
EMAIL_MAX_RETRIES=3
EMAIL_RATE_LIMIT_ENABLED=true
EMAIL_MAX_PER_MINUTE=10
EMAIL_MAX_PER_HOUR=100
```

```javascript
// Use environment variables
import { createConfigFromEnv } from '@prathammahajan/multi-email-sender';

const config = createConfigFromEnv();
const sender = new EmailSender(config);
```

---

## 🏆 **Best Practices & Tips**

### 💡 **Pro Tips for Success**

<details>
<summary><strong>🔐 Security Best Practices</strong></summary>

- ✅ **Use App Passwords** for Gmail/Yahoo (never regular passwords)
- ✅ **Enable 2FA** on your email accounts
- ✅ **Store credentials** in environment variables
- ✅ **Use dedicated email accounts** for sending
- ✅ **Monitor your sending reputation** regularly
</details>

<details>
<summary><strong>⚡ Performance Optimization</strong></summary>

- 🚀 **Batch processing** for large lists (50-100 emails per batch)
- 🚀 **Use appropriate delays** based on your provider
- 🚀 **Monitor rate limits** and adjust accordingly
- 🚀 **Enable logging** for debugging and optimization
- 🚀 **Use templates** for consistent formatting
</details>

<details>
<summary><strong>📊 Monitoring & Analytics</strong></summary>

- 📈 **Track success rates** and identify patterns
- 📈 **Monitor error types** to improve reliability
- 📈 **Set up alerts** for high failure rates
- 📈 **Regular log analysis** for optimization
- 📈 **A/B test** different sending strategies
</details>

---

## 🔧 **Troubleshooting Guide**

### ❓ **Common Issues & Solutions**

<details>
<summary><strong>🔐 Authentication Errors</strong></summary>

**Problem:** `Authentication failed` or `Invalid credentials`

**Solutions:**
1. ✅ Verify email and password are correct
2. ✅ For Gmail: Use app passwords instead of regular passwords
3. ✅ Enable 2-factor authentication
4. ✅ Check if account is locked or suspended
5. ✅ Verify SMTP settings for custom providers

```javascript
// Test your configuration
const isValid = sender.validateConfiguration();
console.log('Configuration valid:', isValid);
```
</details>

<details>
<summary><strong>⏱️ Rate Limiting Issues</strong></summary>

**Problem:** Emails being delayed or blocked

**Solutions:**
1. ✅ Reduce `maxEmailsPerMinute` setting
2. ✅ Increase `delayBetweenEmails`
3. ✅ Use multiple email accounts for rotation
4. ✅ Check your provider's specific limits
5. ✅ Monitor rate limit statistics

```javascript
// Check current rate limit status
const status = sender.rateLimiter.getStatus();
console.log('Rate limit status:', status);
```
</details>

<details>
<summary><strong>🌐 Network & Connection Issues</strong></summary>

**Problem:** Timeouts or connection failures

**Solutions:**
1. ✅ Increase `timeout` setting
2. ✅ Check internet connection stability
3. ✅ Verify SMTP server settings
4. ✅ Try different ports (587 vs 465)
5. ✅ Check firewall settings

```javascript
// Increase timeout for slow networks
const sender = new EmailSender({
  email: { /* config */ },
  options: {
    timeout: 60000, // 60 seconds
    maxRetries: 5
  }
});
```
</details>

---

## 📚 **API Reference**

### 🎯 **Core Classes**

| Class | Description | Key Methods |
|-------|-------------|-------------|
| `EmailSender` | Main email sending class | `sendToMultiple()`, `sendSingle()`, `getStatistics()` |
| `Logger` | Comprehensive logging system | `info()`, `error()`, `getLogs()`, `getStatistics()` |
| `RetryLogic` | Intelligent retry mechanism | `executeWithRetry()`, `getRetryStatistics()` |
| `RateLimiter` | Smart rate limiting | `waitIfNeeded()`, `getStatus()`, `updateConfig()` |

### 🔧 **Configuration Options**

<details>
<summary><strong>EmailSender Options</strong></summary>

```javascript
{
  email: {
    service: 'gmail',           // 'gmail', 'outlook', 'yahoo', 'custom'
    auth: {
      user: 'email@domain.com',
      pass: 'password'
    },
    host: 'smtp.domain.com',    // For custom SMTP
    port: 587,                  // For custom SMTP
    secure: false               // For custom SMTP
  },
  options: {
    dailyLimit: 100,            // Max emails per day
    delayBetweenEmails: 2000,   // Delay in milliseconds
    maxRetries: 3,              // Max retry attempts
    retryDelay: 1000,           // Base retry delay
    timeout: 30000,             // Send timeout
    enableLogging: true,        // Enable detailed logging
    logFile: 'email-logs.json'  // Log file path
  },
  rateLimit: {
    enabled: true,              // Enable rate limiting
    maxEmailsPerMinute: 10,     // Max emails per minute
    maxEmailsPerHour: 100       // Max emails per hour
  }
}
```
</details>

---

## 🤝 **Contributing & Support**

### 🚀 **Get Involved**

We love contributions! Here's how you can help:

1. 🐛 **Report bugs** - Found an issue? Let us know!
2. 💡 **Suggest features** - Have ideas? We'd love to hear them!
3. 🔧 **Submit PRs** - Fix bugs or add features
4. 📖 **Improve docs** - Help others learn
5. ⭐ **Star the repo** - Show your support!

### 📞 **Support Channels**

- 🐛 **Issues**: [GitHub Issues](https://github.com/prathammahajan13/multi-email-sender/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/prathammahajan13/multi-email-sender/discussions)
- 📖 **Documentation**: [GitHub Wiki](https://github.com/prathammahajan13/multi-email-sender/wiki)
- ☕ **Buy me a coffee**: [Support the project](https://buymeacoffee.com/mahajanprae)

---

## 📄 **License & Legal**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**Made with ❤️ by [Pratham Mahajan](https://github.com/prathammahajan13)**

---

## 🎯 **Perfect For**

<div align="center">

| 🛒 **E-commerce** | 📧 **Marketing** | 🔔 **Notifications** | 📊 **Analytics** |
|-------------------|------------------|---------------------|------------------|
| Order confirmations | Newsletter campaigns | System alerts | Performance tracking |
| Shipping updates | Promotional emails | User notifications | Delivery insights |
| Customer support | Welcome sequences | Password resets | Error monitoring |

</div>

---

<div align="center">

### 🚀 **Ready to Transform Your Email Operations?**

[![npm install](https://img.shields.io/badge/npm-install-red.svg)](https://www.npmjs.com/package/@prathammahajan/multi-email-sender)
[![GitHub stars](https://img.shields.io/github/stars/prathammahajan13/multi-email-sender.svg?style=social&label=Star)](https://github.com/prathammahajan13/multi-email-sender)
[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-☕-yellow.svg)](https://buymeacoffee.com/mahajanprae)

**Start sending emails like a pro in 30 seconds!** ⚡

</div>