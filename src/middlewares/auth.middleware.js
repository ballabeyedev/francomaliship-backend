const jwt = require('jsonwebtoken');
const { jwtConfig, ACCESS_COOKIE_NAME } = require('../config/security');
const User = require('../models/utilisateur.model');
const { security } = require('../utils/logger');

/**
 * Middleware d'authentification.
 *
 * Lit l'access token EN PRIORITÉ depuis le cookie httpOnly `access_token`
 * (protection XSS), avec repli sur l'en-tête Authorization Bearer pour la
 * compatibilité avec les clients existants (mobile, etc.).
 */
const authMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies?.[ACCESS_COOKIE_NAME];

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return res.status(401).json({ message: 'Token manquant ou invalide' });
    }

    const decoded = jwt.verify(token, jwtConfig.secret);

    const utilisateur = await User.findByPk(decoded.id);
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    // Un compte désactivé ne peut plus accéder même si le JWT est encore valide
    if (utilisateur.statut !== 'actif') {
      return res.status(403).json({ message: 'Compte désactivé. Contactez le support.' });
    }

    req.user = utilisateur;
    next();
  } catch (err) {
    security.authError(req, err.name || 'token invalide');
    return res.status(401).json({ message: 'Token invalide' });
  }
};

module.exports = authMiddleware;
