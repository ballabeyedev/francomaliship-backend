const express = require('express');
const router = express.Router();
const servicePriceController = require('../../controllers/admin/servicePrice.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requireAdmin } = require('../../middlewares/acl.middleware');
const validate = require('../../middlewares/validate.middleware');
const { servicePriceSchema, servicePriceUpdateSchema } = require('../../validations/pricing.validation');
const { security } = require('../../utils/logger');

const logAction = (action) => (req, res, next) => { security.adminAction(req, action); next(); };

// Toutes les routes sont protégées - admin seulement
router.use(authMiddleware);

router.get('/', servicePriceController.getServicePrices);
router.get('/:id', servicePriceController.getServicePriceById);
router.post('/', requireAdmin, validate(servicePriceSchema), logAction('CREATE_SERVICE_PRICE'), servicePriceController.createServicePrice);
router.put('/:id', requireAdmin, validate(servicePriceUpdateSchema), logAction('UPDATE_SERVICE_PRICE'), servicePriceController.updateServicePrice);
router.delete('/:id', requireAdmin, logAction('DELETE_SERVICE_PRICE'), servicePriceController.deleteServicePrice);

module.exports = router;
