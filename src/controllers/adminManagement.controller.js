const AdminManagementService = require('../services/admin.management.service');
const MenuService = require('../services/menu.service');
const { logger } = require('../utils/logger');

exports.creerAdmin = async (req, res) => {
  try {
    const { nom, prenom, email, permissions } = req.body;
    if (!nom || !prenom || !email) {
      return res.status(400).json({ message: 'nom, prenom et email sont requis.' });
    }
    const admin = await AdminManagementService.creerAdmin({ nom, prenom, email, permissions });
    res.status(201).json({
      message: 'Administrateur créé avec succès.',
      admin: { id: admin.id, nom: admin.nom, prenom: admin.prenom, email: admin.email },
    });
  } catch (err) {
    logger.error('creerAdmin', { message: err.message });
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.listerAdmins = async (req, res) => {
  try {
    const admins = await AdminManagementService.listerAdmins();
    res.json({ admins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.supprimerAdmin = async (req, res) => {
  try {
    const result = await AdminManagementService.supprimerAdmin(req.params.userId);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.getPermissions = async (req, res) => {
  try {
    const perms = await AdminManagementService.getPermissions(req.params.userId);
    res.json({ permissions: perms });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePermissions = async (req, res) => {
  try {
    const result = await AdminManagementService.updatePermissions(
      req.params.userId,
      req.body.permissions || []
    );
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.listerMenus = async (req, res) => {
  try {
    const menus = await MenuService.listerTousMenus();
    res.json({ menus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.creerMenu = async (req, res) => {
  try {
    const menu = await MenuService.creerMenu(req.body);
    res.status(201).json({ menu });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.modifierMenu = async (req, res) => {
  try {
    const menu = await MenuService.modifierMenu(req.params.id, req.body);
    res.json({ menu });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.supprimerMenu = async (req, res) => {
  try {
    const result = await MenuService.supprimerMenu(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};
