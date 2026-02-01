const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, errors } = format;

const myFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}] ${stack || message}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp(),
    colorize({ all: true }),
    myFormat
  ),
  transports: [
    new transports.Console({ handleExceptions: true }),
  ],
  exitOnError: false,
});

// Helper para mascarar PII em logs
logger.maskPII = (value) => {
  if (!value) return value;
  const v = String(value);
  // CPF (11 dígitos)
  if (/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v) || /^\d{11}$/.test(v)) {
    const digits = v.replace(/\D/g, '');
    return digits.replace(/(\d{3})(\d{6})(\d{2})/, '$1***$3');
  }
  // Email
  if (v.includes('@')) {
    const [user, domain] = v.split('@');
    return `${user[0]}***@${domain}`;
  }
  // Phone
  if (/^\(\d{2}\) \d{4,5}-\d{4}$/.test(v) || /^\d{10,11}$/.test(v)) {
    return v.replace(/(\d{2})(\d{3,4})(\d{4})/, '($1) ***-****');
  }
  // Default: mask middle
  return v.length > 6 ? v.slice(0, 3) + '***' + v.slice(-3) : v;
};

module.exports = logger;
