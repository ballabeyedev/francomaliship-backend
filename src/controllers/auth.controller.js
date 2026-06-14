const AuthService = require('../services/auth.service');
const formatUser = require('../utils/formatUser');
const jwt = require('jsonwebtoken');
const { jwtConfig, csrfCookieConfig, CSRF_COOKIE_NAME, REFRESH_COOKIE_NAME } = require('../config/security');
const RefreshToken = require('../models/refreshToken.model');
const { generateTokens, hashToken, setTokenCookies, clearTokenCookies } = require('../utils/tokenManager');
const { generateCsrfToken } = require('../utils/csrfToken');
const { security } = require('../utils/logger');

exports.inscriptionUser = async (req, res) => {
  const {
    nom,
    prenom,
    email,
    mot_de_passe,
    adresse,
    telephone,
    role
  } = req.body;

  try {
    const result = await AuthService.register({
      nom,
      prenom,
      email,
      mot_de_passe,
      adresse,
      telephone: telephone || null,
      role,
    });

    if (!result.success) {
      return res.status(400).json({
        message: result.message
      });
    }

    return res.status(201).json({
      message: result.message,
      utilisateur: formatUser(result.utilisateur)
    });

  } catch (err) {
    console.error('Erreur lors de l’inscription :', err);
    return res.status(500).json({
      message: 'Erreur serveur lors de l’inscription',
      erreur: err.message
    });
  }
};


exports.login = async (req, res) => {
  const { identifiant, mot_de_passe } = req.body;

  try {
    const result = await AuthService.login({ identifiant, mot_de_passe });
    const { utilisateur, error, message } = result;

    if (error || !result.success) {
      security.loginFailed(req, identifiant);
      return res.status(400).json({ message: error || message || 'Identifiant ou mot de passe incorrect' });
    }

    // Génère access + refresh, stocke le hash du refresh pour rotation/révocation
    const { accessToken, refreshToken, refreshExpiresAt } = generateTokens(utilisateur);
    await RefreshToken.create({
      tokenHash: hashToken(refreshToken),
      utilisateurId: utilisateur.id,
      expiresAt: refreshExpiresAt,
      revoked: false
    });

    // Dépose les tokens en cookies httpOnly (PAS dans le body)
    setTokenCookies(res, { accessToken, refreshToken });

    // Cookie CSRF lisible + renvoyé pour double-submit
    const csrf = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, csrf, csrfCookieConfig);

    security.loginSuccess(req, utilisateur.id);

    return res.status(200).json({
      utilisateur: formatUser(utilisateur),
      csrfToken: csrf
    });
  } catch (err) {
    security.authError(req, 'login server error');
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Retourne l'utilisateur courant à partir du cookie d'auth (validation de session)
exports.me = async (req, res) => {
  return res.status(200).json({ utilisateur: formatUser(req.user) });
};

// Génère/renvoie un token CSRF (et dépose le cookie correspondant)
exports.csrfToken = async (req, res) => {
  const csrf = generateCsrfToken();
  res.cookie(CSRF_COOKIE_NAME, csrf, csrfCookieConfig);
  return res.status(200).json({ csrfToken: csrf });
};

//modifier password 
exports.modifierPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { ancienPassword, nouveauPassword } = req.body;

    const result = await AuthService.modifierPassword(
      id,
      nouveauPassword,
      ancienPassword
    );

    // Si le service indique une erreur métier (success = false), renvoyer statut 400
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.modifierProfil = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, telephone, adresse } = req.body;

    const result = await AuthService.modifierProfil(
      id,
      nom,
      prenom,
      email,
      telephone,
      adresse
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      utilisateur: formatUser(result.utilisateur)
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.refresh = async (req, res) => {
  try {
    // Refresh token lu depuis le cookie httpOnly (repli sur le body pour compat)
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token manquant' });
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await RefreshToken.findOne({ where: { tokenHash, revoked: false } });
    if (!stored) {
      clearTokenCookies(res);
      return res.status(401).json({ message: 'Refresh token invalide ou révoqué' });
    }

    if (new Date() > stored.expiresAt) {
      await stored.destroy();
      clearTokenCookies(res);
      return res.status(401).json({ message: 'Refresh token expiré' });
    }

    let payload;
    try {
      payload = jwt.verify(refreshToken, jwtConfig.refreshSecret);
    } catch {
      await stored.destroy();
      clearTokenCookies(res);
      return res.status(401).json({ message: 'Refresh token invalide' });
    }

    // ROTATION : on révoque l'ancien et on émet un nouveau couple
    stored.revoked = true;
    await stored.save();

    const { accessToken, refreshToken: newRefresh, refreshExpiresAt } =
      generateTokens({ id: payload.id, role: payload.role });

    await RefreshToken.create({
      tokenHash: hashToken(newRefresh),
      utilisateurId: payload.id,
      expiresAt: refreshExpiresAt,
      revoked: false
    });

    setTokenCookies(res, { accessToken, refreshToken: newRefresh });

    const csrf = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, csrf, csrfCookieConfig);

    return res.status(200).json({ message: 'Token rafraîchi', csrfToken: csrf });
  } catch (err) {
    security.authError(req, 'refresh server error');
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
    if (refreshToken) {
      await RefreshToken.update({ revoked: true }, { where: { tokenHash: hashToken(refreshToken) } });
    }
    clearTokenCookies(res);
    res.clearCookie(CSRF_COOKIE_NAME, { ...csrfCookieConfig });
    return res.status(200).json({ message: 'Déconnexion réussie' });
  } catch (err) {
    security.authError(req, 'logout server error');
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.oublierPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await AuthService.oublierPassword(email);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const result = await AuthService.resetPassword(token, password);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
