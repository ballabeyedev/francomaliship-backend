const express = require('express');
const router  = express.Router();
const authController = require('../controllers/auth.controller');
const { authRateLimit, loginLimiter } = require('../middlewares/rateLimit.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require('../validations/auth.validation');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/register', validate(registerSchema), authController.inscriptionUser);
router.post('/login',    loginLimiter, validate(loginSchema), authController.login);

// Refresh token (lit le cookie httpOnly) — rate-limité pour éviter les abus
router.post('/refresh', authRateLimit, authController.refresh);

// Logout — révoque le refresh token et supprime les cookies
router.post('/logout', authController.logout);

// Génération d'un token CSRF
router.post('/csrf-token', authController.csrfToken);

// Utilisateur courant (validation de session au montage du frontend)
router.get('/me', authMiddleware, authController.me);

// Mot de passe oublié / réinitialisation
router.post('/oublier-password', authRateLimit, validate(forgotPasswordSchema), authController.oublierPassword);
router.post('/reset-password/:token', authRateLimit, validate(resetPasswordSchema), authController.resetPassword);

// Modifier profil / mot de passe (protégé)
router.put('/modifier-password/:id', authMiddleware, authController.modifierPassword);
router.put('/modifier-profil/:id',   authMiddleware, authController.modifierProfil);

module.exports = router;
