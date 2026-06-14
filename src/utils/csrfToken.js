const crypto = require('crypto');

/**
 * Génération / vérification de tokens CSRF (pattern double-submit signé).
 *
 * Le token est de la forme `<random>.<hmac>` où hmac = HMAC-SHA256(random, secret).
 * Il est déposé à la fois dans un cookie lisible (csrf_token) et renvoyé au
 * frontend qui le rejoue dans l'en-tête X-CSRF-Token. Le serveur vérifie que
 * les deux correspondent et que la signature est valide — un attaquant
 * cross-site ne peut pas forger un en-tête valide car il ne connaît pas le
 * cookie (SameSite) et ne peut pas signer sans le secret.
 */

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET;

function sign(value) {
  return crypto.createHmac('sha256', CSRF_SECRET).update(value).digest('hex');
}

function generateCsrfToken() {
  const random = crypto.randomBytes(24).toString('hex');
  return `${random}.${sign(random)}`;
}

function verifyCsrfToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [random, signature] = token.split('.');
  if (!random || !signature) return false;
  const expected = sign(random);
  // Comparaison à temps constant
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

module.exports = { generateCsrfToken, verifyCsrfToken };
