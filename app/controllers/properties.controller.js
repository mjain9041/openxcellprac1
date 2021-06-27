const db = require("../models");
const { validationResult } = require('express-validator')
const { uuid } = require('uuidv4');
const Op = db.Sequelize.Op;
const Properties = db.properties;
const PropertyPics = db.property_pics;
const RecentProducts = db.recent_products;
const Users = db.users;
const fs = require('fs');
const path = require('path')
const sharp = require('sharp');
var moment = require('moment');
// Create and Save a new Property
exports.create = async(req, res) => {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res.json(errors.mapped())
        }
        const data = {
            property_name: req.body.property_name,
            address: req.body.address,
            locality:req.body.locality,
            price: req.body.price,
            bedroom: req.body.bedroom,
            bathroom:req.body.bathroom,
            area_sqft:req.body.area_sqft
        }
        const addProperty = await Properties.create(data)
        await fs.mkdirSync(path.join('uploads', `${addProperty.id}`));
        let imageData = []
        for (i = 0; i < req.files['property_pics[]'].length; i++) {
            let extension = (path.extname( req.files['property_pics[]'][i].name)).toLowerCase();
            let property_pic = req.files['property_pics[]'][i];
            let fileName = uuid()
            let imagePath = `uploads/${addProperty.id}/${fileName}.${extension}`
            await property_pic.mv(imagePath)
            let thumbnailPath = `uploads/${addProperty.id}/${fileName}_thumb.${extension}`
            await sharp(imagePath).resize(200, 200).toFile(thumbnailPath)
            imageData.push({
                property_id: addProperty.id,
                image_path: imagePath,
                thumbnail_path: thumbnailPath,
            })
        }
        await PropertyPics.bulkCreate(imageData,{returning: true})
        res.json({message: 'Property added successfully'})
    } catch(err) {
        res.json(err)
    }
};

// Retrieve all Properties from the database.
exports.findAll = async (req, res) => {
  try {
    let filter = {}
    if(req.query.productName) 
        filter.property_name = {  [Op.like]: '%' + req.query.productName + '%' }
    if(req.query.address) 
        filter.address = {  [Op.like]: '%' + req.query.address + '%' }
    if(req.query.locality) 
        filter.locality = {  [Op.like]: '%' + req.query.locality + '%' }
    if(req.query.locality) 
        filter.locality = {  [Op.like]: '%' + req.query.locality + '%' }
    if(req.query.bathroomCount) 
        filter.bathroom = req.query.bathroomCount
    if(req.query.bedroomCount) 
        filter.bedroom = req.query.bedroomCount
    if(req.query.createdDate)
        filter.created_at = {[Op.eq]: req.query.createdDate }
    if(req.query.startPrice && req.query.endPrice) 
        filter.price = {[Op.between]: [req.query.startPrice, req.query.endPrice]}
    
    let propertyData = await Properties.findAndCountAll({
        where: filter,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        offset: req.query.offset ? Number(req.query.offset) : 0,
    })
    for( let i=0; i < propertyData.rows.length; i++ ) {
        propertyData.rows[i].dataValues.area_sqmt = propertyData.rows[i].dataValues.area_sqft * process.env.SQMT_CONVERT
        propertyData.rows[i].dataValues.area_sqyd = propertyData.rows[i].dataValues.area_sqft / process.env.SQYD_CONVERT
        let propertyPics = await PropertyPics.findAll({ 
            attributes: ['id', 'image_path', 'thumbnail_path'],
            where: {property_id: propertyData.rows[i].dataValues.id}
        })
        propertyData.rows[i].dataValues.propertyPics = propertyPics 
    }
    let recentProduct = await RecentProducts.findAll({
        limit: 5,
        order: [
            ['last_visited', 'DESC'],
        ],
    })

    if(recentProduct.length == 0) {
        recentProduct = await Properties.findAll({
            limit: 5,
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        for( let i=0; i < recentProduct.length; i++ ) {
            let propertyPics = await PropertyPics.findAll({ 
                attributes: ['id', 'image_path', 'thumbnail_path'],
                where: {property_id: recentProduct[i].dataValues.id}
            })
            recentProduct[i].dataValues.propertyPics = propertyPics 
        }
    } else {
        let propertyId = []
        for( let i=0; i < recentProduct.length; i++ ) {
            propertyId.push(recentProduct[i].dataValues.property_id) 
        }
        recentProduct = await Properties.findAll({
            where: {
                id: { [Op.in]:propertyId }
            },
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        for( let i=0; i < recentProduct.length; i++ ) {
            let propertyPics = await PropertyPics.findAll({ 
                attributes: ['id', 'image_path', 'thumbnail_path'],
                where: {property_id: recentProduct[i].dataValues.id}
            })
            recentProduct[i].dataValues.propertyPics = propertyPics 
        }
    }
    res.json({ data: { propertyData, recentProduct  }})
  } catch(err) {
    res.json(err)
  }
};

// Find a single Property with an id
exports.findOne = async (req, res) => {
  try{
    let property = await Properties.findOne({ 
        where: { id:  req.params.id}
    })
    if(property){
        let propertyPics =  await PropertyPics.findAll({
            attributes: ['id', 'image_path', 'thumbnail_path'],
            where: { property_id: property.dataValues.id }
        })
        property.dataValues.propertyPics = propertyPics

        Properties.increment('view_count', { by: 1, where: { id: property.dataValues.id }});
        let checkRecentProduct = await RecentProducts.findOne({
            where: { property_id: property.dataValues.id }
        })
        if(checkRecentProduct) {
            await RecentProducts.update({
                last_visited: moment().format('YYYY-MM-DD hh:mm:ss')
            },{ where: { property_id: property.dataValues.id }})
        } else {
            await RecentProducts.create({
                property_id: property.dataValues.id
            })
        }
        return res.json(property)
    }
    res.status(404).json({message: 'data not found'})
  } catch(err){
    res.json(err.stack)
  }
};