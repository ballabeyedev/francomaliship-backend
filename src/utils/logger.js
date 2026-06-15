const path = require('path');
const fs = require('fs');
const winston = require('winston');

/**
 * Logger de sécurité centralisé (winston).
 *
 * Trois sorties fichiers :
 *  - error.log    : niveau error (exceptions, erreurs serveur)
 *  - security.log : événements de sécurité (login échoué, 403, actions admin)
 *  - combined.log : tout
 *
 * Aucune donnée sensible (mot de passe, token) ne doit être loggée :
 * les helpers ci-dessous ne reçoivent que des identifiants non secrets.
 */

const logDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'nanei-api' },
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, 'combined.log') })
  ]
});

// Logger dédié aux événements de sécurité
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { channel: 'security' },
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'security.log') }),
    new winston.transports.File({ filename: path.join(logDir, 'combined.log') })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  const consoleTransport = new winston.transports.Console({
    format: winston.format.simple()
  });
  logger.add(consoleTransport);
  securityLogger.add(consoleTransport);
}

/** IP réelle derrière le reverse proxy */
function getIp(req) {
  return req?.ip || req?.headers?.['x-forwarded-for'] || req?.connection?.remoteAddress || 'unknown';
}

const security = {
  loginFailed(req, identifiant) {
    securityLogger.warn('LOGIN_FAILED', { identifiant, ip: getIp(req), ua: req?.headers?.['user-agent'] });
  },
  loginSuccess(req, userId) {
    securityLogger.info('LOGIN_SUCCESS', { userId, ip: getIp(req) });
  },
  accessDenied(req, reason) {
    securityLogger.warn('ACCESS_DENIED', {
      userId: req?.user?.id || null,
      role: req?.user?.role || null,
      reason,
      method: req?.method,
      path: req?.originalUrl,
      ip: getIp(req)
    });
  },
  adminAction(req, action, details = {}) {
    securityLogger.info('ADMIN_ACTION', {
      userId: req?.user?.id || null,
      action,
      method: req?.method,
      path: req?.originalUrl,
      ip: getIp(req),
      ...details
    });
  },
  authError(req, message) {
    securityLogger.warn('AUTH_ERROR', { message, ip: getIp(req), path: req?.originalUrl });
  },
  csrfFailure(req) {
    securityLogger.warn('CSRF_FAILURE', { ip: getIp(req), method: req?.method, path: req?.originalUrl });
  }
};

module.exports = { logger, securityLogger, security };
