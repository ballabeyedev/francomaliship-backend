require('dotenv').config();

const JWT_SECRET         = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_RESET_SECRET   = process.env.JWT_RESET_SECRET;

// Bloque le démarrage si un secret est absent ou si deux secrets sont identiques
const missingSecrets = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'JWT_RESET_SECRET'].filter(k => !process.env[k]);
if (missingSecrets.length) {
  throw new Error(`Variables d'environnement manquantes : ${missingSecrets.join(', ')}`);
}
if (JWT_SECRET === JWT_REFRESH_SECRET || JWT_SECRET === JWT_RESET_SECRET || JWT_REFRESH_SECRET === JWT_RESET_SECRET) {
  throw new Error('JWT_SECRET, JWT_REFRESH_SECRET et JWT_RESET_SECRET doivent tous être différents.');
}

/**
 * Configuration JWT
 */
const jwtConfig = {
  secret: JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshSecret: JWT_REFRESH_SECRET,
  refreshExpiresIn: '7d',
  resetSecret: JWT_RESET_SECRET,
  resetExpiresIn: '1h'
};

/**
 * Configuration Bcrypt
 */
const bcryptConfig = {
  saltRounds: 12
};

/**
 * Rate Limiting (anti brute force)
 */
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
};

const authRateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives. Veuillez réessayer dans 15 minutes.' }
};

/**
 * CORS sécurisé
 */
const corsConfig = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  credentials: true
};

/**
 * Cookies (httpOnly auth tokens + CSRF)
 *
 * Le frontend admin (Vercel) et l'API (Render) sont sur des origines
 * différentes. Pour que le navigateur envoie les cookies en cross-site,
 * il faut sameSite='none' + secure=true en production.
 * En développement local (http), on retombe sur 'lax' sans secure.
 */
const isProd = process.env.NODE_ENV === 'production';

const cookieConfig = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/'
};

// Cookie CSRF : lisible par le JS frontend (double-submit), donc httpOnly=false
const csrfCookieConfig = {
  httpOnly: false,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/'
};

const ACCESS_COOKIE_NAME = 'access_token';
const REFRESH_COOKIE_NAME = 'refresh_token';
const CSRF_COOKIE_NAME = 'csrf_token';

/**
 * Upload fichiers (PDF / Signature)
 */
const uploadConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5 MB
  allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg']
};

/**
 * Chiffrement & Hash
 */
const cryptoConfig = {
  hashAlgorithm: 'sha256',
  encoding: 'hex'
};

module.exports = {
  jwtConfig,
  bcryptConfig,
  rateLimitConfig,
  authRateLimitConfig,
  corsConfig,
  cookieConfig,
  csrfCookieConfig,
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  uploadConfig,
  cryptoConfig
};
