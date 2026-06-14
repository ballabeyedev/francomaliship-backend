const express = require('express');
const router = express.Router();
const shippingPriceController = require('../../controllers/admin/shippingPrice.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requireAdmin } = require('../../middlewares/acl.middleware');
const validate = require('../../middlewares/validate.middleware');
const { shippingPriceSchema, shippingPriceUpdateSchema } = require('../../validations/pricing.validation');
const { security } = require('../../utils/logger');

const logAction = (action) => (req, res, next) => { security.adminAction(req, action); next(); };

// Toutes les routes sont protégées - admin seulement
router.use(authMiddleware);

router.get('/', shippingPriceController.getShippingPrices);
router.get('/:id', shippingPriceController.getShippingPriceById);
router.post('/', requireAdmin, validate(shippingPriceSchema), logAction('CREATE_SHIPPING_PRICE'), shippingPriceController.createShippingPrice);
router.put('/:id', requireAdmin, validate(shippingPriceUpdateSchema), logAction('UPDATE_SHIPPING_PRICE'), shippingPriceController.updateShippingPrice);
router.delete('/:id', requireAdmin, logAction('DELETE_SHIPPING_PRICE'), shippingPriceController.deleteShippingPrice);

module.exports = router;
