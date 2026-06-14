const Joi = require('joi');

/**
 * Schémas de validation stricte pour les routes de pricing (admin).
 * Les chaînes sont trim ; les valeurs numériques doivent être des nombres
 * positifs finis. Les clés inconnues sont supprimées par le middleware.
 */

const countrySchema = Joi.object({
  name: Joi.string().trim().min(2).max(60).pattern(/^[\p{L}][\p{L}\s'-]*$/u).required()
    .messages({ 'string.pattern.base': 'Nom de pays invalide' }),
  code: Joi.string().trim().uppercase().min(2).max(5).pattern(/^[A-Z]+$/).required()
    .messages({ 'string.pattern.base': 'Code pays invalide' }),
  isActive: Joi.boolean().optional()
});

const countryUpdateSchema = countrySchema.fork(['name', 'code'], (s) => s.optional());

const shippingPriceSchema = Joi.object({
  countryId: Joi.string().trim().required(),
  type: Joi.string().trim().valid('aérien', 'maritime', 'aerien', 'terrestre').required(),
  minWeight: Joi.number().min(0).required(),
  maxWeight: Joi.number().greater(Joi.ref('minWeight')).required(),
  pricePerKg: Joi.number().min(0).required()
});

const shippingPriceUpdateSchema = Joi.object({
  countryId: Joi.string().trim().optional(),
  type: Joi.string().trim().valid('aérien', 'maritime', 'aerien', 'terrestre').optional(),
  minWeight: Joi.number().min(0).optional(),
  maxWeight: Joi.number().optional(),
  pricePerKg: Joi.number().min(0).optional()
});

const servicePriceSchema = Joi.object({
  countryId: Joi.string().trim().required(),
  serviceType: Joi.string().trim().min(2).max(60).required(),
  price: Joi.number().min(0).required()
});

const servicePriceUpdateSchema = Joi.object({
  countryId: Joi.string().trim().optional(),
  serviceType: Joi.string().trim().min(2).max(60).optional(),
  price: Joi.number().min(0).optional()
});

module.exports = {
  countrySchema,
  countryUpdateSchema,
  shippingPriceSchema,
  shippingPriceUpdateSchema,
  servicePriceSchema,
  servicePriceUpdateSchema
};
