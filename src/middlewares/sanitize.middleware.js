/**
 * Middleware de nettoyage des entrées (req.body).
 *
 * - Trim toutes les chaînes.
 * - Échappe les caractères HTML dangereux (<, >, ", ', &, /) pour prévenir
 *   le XSS stocké si la donnée est plus tard rendue côté client.
 * - Supprime les balises de type <script> intégralement.
 *
 * À appliquer après le parsing du body et avant les contrôleurs.
 */

const HTML_ESCAPE = {
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '&': '&amp;'
};

function escapeString(str) {
  return str
    // supprime les balises script entières
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/[<>"'/&]/g, (c) => HTML_ESCAPE[c]);
}

function sanitizeValue(value) {
  if (typeof value === 'string') return escapeString(value.trim());
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value)) out[k] = sanitizeValue(value[k]);
    return out;
  }
  return value;
}

const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  next();
};

module.exports = { sanitizeBody, sanitizeValue, escapeString };
