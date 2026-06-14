const { security } = require('../utils/logger');

/**
 * Middlewares de contrôle d'accès (ACL).
 *
 * À utiliser APRÈS le middleware d'authentification (qui peuple req.user).
 * Tout refus est journalisé dans security.log.
 *
 * Le modèle ne distingue actuellement que 'Admin' et 'Particulier'.
 * requireSuperAdmin se base sur un éventuel champ isSuperAdmin / role 'SuperAdmin'
 * pour rester compatible avec une future granularité, tout en acceptant 'Admin'
 * comme super-admin par défaut tant que le rôle dédié n'existe pas.
 */

function requireAdmin(req, res, next) {
  if (!req.user) {
    security.accessDenied(req, 'non authentifié');
    return res.status(401).json({ message: 'Utilisateur non authentifié' });
  }
  if (req.user.role !== 'Admin' && req.user.role !== 'SuperAdmin') {
    security.accessDenied(req, 'rôle non admin');
    return res.status(403).json({ message: 'Accès refusé : privilèges administrateur requis' });
  }
  next();
}

function requireSuperAdmin(req, res, next) {
  if (!req.user) {
    security.accessDenied(req, 'non authentifié');
    return res.status(401).json({ message: 'Utilisateur non authentifié' });
  }
  const isSuper = req.user.role === 'SuperAdmin' || req.user.isSuperAdmin === true || req.user.role === 'Admin';
  if (!isSuper) {
    security.accessDenied(req, 'rôle non super-admin');
    return res.status(403).json({ message: 'Accès refusé : privilèges super-administrateur requis' });
  }
  next();
}

/**
 * Vérifie la permission d'accès à un menu/section donné.
 * Si l'utilisateur possède un tableau `permissions`, on contrôle l'appartenance ;
 * sinon, un Admin a accès à tout par défaut.
 */
function checkMenuPermission(menuKey) {
  return (req, res, next) => {
    if (!req.user) {
      security.accessDenied(req, 'non authentifié');
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }
    const perms = req.user.permissions;
    const isAdmin = req.user.role === 'Admin' || req.user.role === 'SuperAdmin';

    if (Array.isArray(perms) && perms.length > 0) {
      if (!perms.includes(menuKey)) {
        security.accessDenied(req, `permission menu manquante: ${menuKey}`);
        return res.status(403).json({ message: `Accès refusé au menu: ${menuKey}` });
      }
      return next();
    }

    if (!isAdmin) {
      security.accessDenied(req, `accès menu refusé: ${menuKey}`);
      return res.status(403).json({ message: 'Accès refusé' });
    }
    next();
  };
}

module.exports = { requireAdmin, requireSuperAdmin, checkMenuPermission };
