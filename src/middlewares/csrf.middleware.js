const { verifyCsrfToken } = require('../utils/csrfToken');
const { CSRF_COOKIE_NAME } = require('../config/security');
const { security } = require('../utils/logger');

/**
 * Middleware de protection CSRF (double-submit).
 *
 * Ne s'applique qu'aux méthodes mutantes (POST/PUT/PATCH/DELETE). On vérifie :
 *   1. La présence de l'en-tête X-CSRF-Token ET du cookie csrf_token
 *   2. Que les deux valeurs sont identiques
 *   3. Que la signature HMAC du token est valide
 */
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

const verifyCsrf = (req, res, next) => {
  if (SAFE_METHODS.includes(req.method)) return next();

  const headerToken = req.headers['x-csrf-token'];
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];

  if (!headerToken || !cookieToken || headerToken !== cookieToken || !verifyCsrfToken(headerToken)) {
    security.csrfFailure(req);
    return res.status(403).json({ message: 'CSRF token invalide ou manquant' });
  }

  next();
};

module.exports = { verifyCsrf };
