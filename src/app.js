const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { corsConfig, rateLimitConfig } = require('./config/security');
const { apiLimiter } = require('./middlewares/rateLimit.middleware');
const { verifyCsrf } = require('./middlewares/csrf.middleware');
const { sanitizeBody } = require('./middlewares/sanitize.middleware');

const app = express();

// Render.com utilise un reverse proxy — nécessaire pour express-rate-limit
app.set('trust proxy', 1);

// Middlewares globaux
app.use(helmet());
app.use(cors(corsConfig));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(rateLimit(rateLimitConfig));


// Routes
const authRoutes = require('./routes/auth.route');
const accountRoutes = require('./routes/account.route');
const envoieColisRoutes = require('./routes/client/envoieColis.route');
const gestionUtilisateurRoutes = require('./routes/admin/gestionutilisateur.route');
const gestionColisRoutes = require('./routes/admin/gestioncolis.routes');
const gestionAdminRoutes = require('./routes/admin/gestionadmin.route');
const messageClientRoutes = require('./routes/messageClient.route');
const countryRoutes = require('./routes/admin/country.route');
const shippingPriceRoutes = require('./routes/admin/shippingPrice.route');
const servicePriceRoutes = require('./routes/admin/servicePrice.route');
const pricingRoutes = require('./routes/pricing.route');
const adminManagementRoutes = require('./routes/admin/adminManagement.route');

// Serveur fichiers statiques pour les uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Définition des routes
app.use('/nanei/auth', authRoutes);
app.use('/nanei/account', accountRoutes);
app.use('/nanei/client', envoieColisRoutes);

// Routes admin : rate limiting + protection CSRF sur les méthodes mutantes
app.use('/nanei/admin', apiLimiter, verifyCsrf, sanitizeBody, gestionUtilisateurRoutes);
app.use('/nanei/admin', apiLimiter, verifyCsrf, sanitizeBody, gestionColisRoutes);
app.use('/nanei/admin', apiLimiter, verifyCsrf, sanitizeBody, gestionAdminRoutes);
app.use('/nanei/messages', messageClientRoutes);

// Pricing routes (admin) : rate limiting + CSRF
app.use('/nanei/admin/countries', apiLimiter, verifyCsrf, countryRoutes);
app.use('/nanei/admin/shipping-prices', apiLimiter, verifyCsrf, shippingPriceRoutes);
app.use('/nanei/admin/service-prices', apiLimiter, verifyCsrf, servicePriceRoutes);
app.use('/nanei/pricing', pricingRoutes);

// RBAC : gestion des admins, menus et permissions
app.use('/nanei/admin/rbac', apiLimiter, verifyCsrf, sanitizeBody, adminManagementRoutes);

module.exports = app;
