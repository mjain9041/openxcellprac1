const { body } = require('express-validator')

module.exports = app => {
  const property = require("../controllers/properties.controller.js");
  const customValidation = require("../customValidation/validateImage.validation");
  var router = require("express").Router();

  // Create a new Property
  router.post("/", [
    body('property_name').notEmpty().withMessage('Please insert property name').isLength({ max: 100 }).withMessage('Propery name not greater then 100 character'),
    body('address').notEmpty().withMessage('Please insert address').isLength({ max: 250 }).withMessage('Address not greater then 250 character'),
    body('locality').notEmpty().withMessage('Please insert locality').isLength({ max: 100 }).withMessage('Locality not greater then 100 character'),
    body('price').isDecimal().withMessage('Price must be number').isFloat({ min: 1 }).withMessage('price must be a greater then 0'),
    body('bathroom').isInt({ min: 1 }).withMessage('Bathroom must be number'),
    body('bedroom').isInt({ min: 1 }).withMessage('Bedroom must be number'),
    body('area_sqft').isDecimal().withMessage('Area must be number').isFloat({ min: 1 }).withMessage('area must be a greater then 0'),
    body('property_pics').custom((value,{req})=>{  return customValidation.validateImage(req.files); }),
  ], property.create);

  // Retrieve all Property
  router.get("/", property.findAll);

  // Retrieve a single Property with id
  router.get("/:id", property.findOne);

  app.use('/api/properties', router);
};