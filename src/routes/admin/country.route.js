const express = require('express');
const router = express.Router();
const countryController = require('../../controllers/admin/country.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requireAdmin } = require('../../middlewares/acl.middleware');
const validate = require('../../middlewares/validate.middleware');
const { countrySchema, countryUpdateSchema } = require('../../validations/pricing.validation');
const { security } = require('../../utils/logger');

const logAction = (action) => (req, res, next) => { security.adminAction(req, action); next(); };

// Toutes les routes sont protégées - admin seulement
router.use(authMiddleware);

router.get('/', countryController.getCountries);
router.get('/:id', countryController.getCountryById);
router.post('/', requireAdmin, validate(countrySchema), logAction('CREATE_COUNTRY'), countryController.createCountry);
router.put('/:id', requireAdmin, validate(countryUpdateSchema), logAction('UPDATE_COUNTRY'), countryController.updateCountry);
router.delete('/:id', requireAdmin, logAction('DELETE_COUNTRY'), countryController.deleteCountry);

module.exports = router;
