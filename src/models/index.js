// models/index.js
const Utilisateur = require('./utilisateur.model');
const Colis = require('./colis.model');
const Notifications = require('./notification.model');
const MessageClient = require('./messageClient.model');
const Country = require('./country.model');
const ShippingPrice = require('./shippingPrice.model');
const ServicePrice = require('./servicePrice.model');
const Menu = require('./menu.model');
const Permission = require('./permission.model');
const sequelize = require('../config/db');

// 🔹 Associations RBAC
Menu.hasMany(Permission, { foreignKey: 'menuId', as: 'permissions' });
Permission.belongsTo(Menu, { foreignKey: 'menuId', as: 'menu' });

Permission.belongsTo(Utilisateur, { foreignKey: 'userId', as: 'utilisateur' });
Utilisateur.hasMany(Permission, { foreignKey: 'userId', as: 'permissions' });

// 🔹 Associations Colis
Utilisateur.hasMany(Colis, { foreignKey: 'expediteurId', as: 'colisEnvoyes' });
Utilisateur.hasMany(Colis, { foreignKey: 'recepteurId', as: 'colisRecus' });

Colis.belongsTo(Utilisateur, { foreignKey: 'expediteurId', as: 'expediteur' });
Colis.belongsTo(Utilisateur, { foreignKey: 'recepteurId', as: 'recepteur' });

// 🔹 Associations Notifications
Notifications.belongsTo(Colis, { foreignKey: 'colisId', as: 'colis' });
Notifications.belongsTo(Utilisateur, { foreignKey: 'expediteurId', as: 'expediteur' });
Notifications.belongsTo(Utilisateur, { foreignKey: 'recepteurId', as: 'recepteur' });

Utilisateur.hasMany(Notifications, { foreignKey: 'expediteurId', as: 'notificationsEnvoyees' });
Utilisateur.hasMany(Notifications, { foreignKey: 'recepteurId', as: 'notificationsRecues' });

module.exports = {
  Utilisateur,
  Colis,
  Notifications,
  MessageClient,
  Country,
  ShippingPrice,
  ServicePrice,
  Menu,
  Permission,
  sequelize,
};