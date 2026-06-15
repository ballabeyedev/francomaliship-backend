require('dotenv').config();
const { sequelize, Menu } = require('../models');

const DEFAULT_MENUS = [
  { name: "Tableau de bord",   code: 'DASHBOARD',        path: '/francomaliship/dashboard',              icon: 'dashboard',  ordre: 1 },
  { name: 'Colis',             code: 'COLIS',             path: '/francomaliship/admin/colis',            icon: 'box',        ordre: 2 },
  { name: 'Colis en attente',  code: 'COLIS_ATTENTE',     path: '/francomaliship/admin/colis/en-attente', icon: 'clock',      ordre: 3 },
  { name: 'Colis livrés',      code: 'COLIS_LIVRES',      path: '/francomaliship/admin/colis/livres',     icon: 'check',      ordre: 4 },
  { name: 'Colis récupérés',   code: 'COLIS_RECUPERES',   path: '/francomaliship/admin/colis/recuperes',  icon: 'archive',    ordre: 5 },
  { name: 'Utilisateurs',      code: 'UTILISATEURS',      path: '/francomaliship/admin/utilisateurs',     icon: 'users',      ordre: 6 },
  { name: 'Administrateurs',   code: 'ADMINS',            path: '/francomaliship/admin/admins',           icon: 'shield',     ordre: 7 },
  { name: 'Pays',              code: 'COUNTRIES',         path: '/francomaliship/admin/countries',        icon: 'globe',      ordre: 8 },
  { name: 'Prix expédition',   code: 'SHIPPING_PRICES',   path: '/francomaliship/admin/shipping-prices',  icon: 'tag',        ordre: 9 },
  { name: 'Prix services',     code: 'SERVICE_PRICES',    path: '/francomaliship/admin/service-prices',   icon: 'service',    ordre: 10 },
  { name: 'Menus',             code: 'MENUS',             path: '/francomaliship/admin/menus',            icon: 'menu',       ordre: 11 },
];

async function seedMenus() {
  await sequelize.authenticate();
  for (const m of DEFAULT_MENUS) {
    await Menu.findOrCreate({ where: { code: m.code }, defaults: m });
  }
  console.log('[SEED] Menus FrancoMaliShip initialisés.');
  process.exit(0);
}

seedMenus().catch((e) => { console.error(e); process.exit(1); });
