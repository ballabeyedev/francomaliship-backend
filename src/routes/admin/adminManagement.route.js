const router = require('express').Router();
const ctrl = require('../../controllers/adminManagement.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.use(authMiddleware);

// Admins
router.post('/admins',                    ctrl.creerAdmin);
router.get('/admins',                     ctrl.listerAdmins);
router.delete('/admins/:userId',          ctrl.supprimerAdmin);
router.get('/admins/:userId/permissions', ctrl.getPermissions);
router.put('/admins/:userId/permissions', ctrl.updatePermissions);

// Menus
router.get('/menus',        ctrl.listerMenus);
router.post('/menus',       ctrl.creerMenu);
router.put('/menus/:id',    ctrl.modifierMenu);
router.delete('/menus/:id', ctrl.supprimerMenu);

module.exports = router;
