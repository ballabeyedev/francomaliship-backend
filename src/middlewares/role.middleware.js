const authMiddleware = require('./auth.middleware');
const { security } = require('../utils/logger');

/**
 * Vérification stricte de rôle. À utiliser après authMiddleware.
 * @param {string|string[]} roles - rôle(s) autorisé(s)
 */
const roleMiddleware = (roles = []) => {
  if (typeof roles === 'string') roles = [roles];

  return (req, res, next) => {
    if (!req.user) {
      security.accessDenied(req, 'non authentifié (role)');
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }
    if (!roles.includes(req.user.role)) {
      security.accessDenied(req, `rôle non autorisé: ${req.user.role}`);
      return res.status(403).json({ message: 'Accès refusé: rôle non autorisé' });
    }
    next();
  };
};

module.exports = { authMiddleware, roleMiddleware };
