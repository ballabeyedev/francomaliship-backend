const rateLimit = require('express-rate-limit');
const { authRateLimitConfig } = require('../config/security');
const { security } = require('../utils/logger');

// Conservé pour compatibilité avec les routes existantes
const authRateLimit = rateLimit(authRateLimitConfig);

/**
 * loginLimiter : 5 tentatives par fenêtre de 15 minutes par IP.
 * Protège l'endpoint de connexion contre le brute-force.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
  handler: (req, res, next, options) => {
    security.accessDenied(req, 'rate limit login dépassé');
    res.status(options.statusCode).json(options.message);
  }
});

/**
 * apiLimiter : 100 requêtes par minute par IP pour les routes /admin/*.
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de requêtes. Veuillez ralentir.' }
});

module.exports = { authRateLimit, loginLimiter, apiLimiter };
