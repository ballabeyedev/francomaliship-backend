const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {
  jwtConfig,
  cookieConfig,
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME
} = require('../config/security');

/**
 * Gestion centralisée des tokens JWT (access + refresh) et des cookies httpOnly.
 *
 * - L'access token contient le minimum d'informations (id + role).
 * - Le refresh token est stocké côté serveur sous forme de hash SHA-256
 *   (voir RefreshToken model) pour permettre la rotation/révocation.
 * - Les deux sont déposés dans des cookies httpOnly inaccessibles au JS,
 *   ce qui protège contre le vol de token par XSS.
 */

const ACCESS_MAX_AGE = 60 * 60 * 1000;            // 1h
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000;  // 7j

/**
 * Génère un couple access + refresh token pour un utilisateur.
 * @param {object} utilisateur - instance Sequelize ou objet plain
 * @returns {{ accessToken: string, refreshToken: string, refreshExpiresAt: Date }}
 */
function generateTokens(utilisateur) {
  const payload = {
    id: utilisateur.id,
    role: utilisateur.role
  };

  const accessToken = jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn
  });

  const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn
  });

  const refreshExpiresAt = new Date(Date.now() + REFRESH_MAX_AGE);

  return { accessToken, refreshToken, refreshExpiresAt };
}

/**
 * Hash SHA-256 d'un token (utilisé pour stocker le refresh token en DB).
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Dépose les tokens dans des cookies httpOnly.
 */
function setTokenCookies(res, { accessToken, refreshToken }) {
  res.cookie(ACCESS_COOKIE_NAME, accessToken, {
    ...cookieConfig,
    maxAge: ACCESS_MAX_AGE
  });
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    ...cookieConfig,
    maxAge: REFRESH_MAX_AGE
  });
}

/**
 * Supprime les cookies d'authentification (logout).
 */
function clearTokenCookies(res) {
  const opts = { ...cookieConfig };
  delete opts.maxAge;
  res.clearCookie(ACCESS_COOKIE_NAME, opts);
  res.clearCookie(REFRESH_COOKIE_NAME, opts);
}

module.exports = {
  generateTokens,
  hashToken,
  setTokenCookies,
  clearTokenCookies,
  ACCESS_MAX_AGE,
  REFRESH_MAX_AGE
};
