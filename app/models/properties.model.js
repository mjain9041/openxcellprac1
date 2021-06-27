'use strict';
module.exports = (sequelize, Sequelize) => {
    const Properties = sequelize.define("properties", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false, 
        autoIncrement: true,
        primaryKey: true,
      },
      property_name: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.STRING
      },
      locality: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.DECIMAL(10,2)
      },
      bedroom: {
        type: Sequelize.INTEGER
      },
      bathroom: {
        type: Sequelize.INTEGER
      },
      area_sqft: {
        type: Sequelize.DECIMAL(10,2)
      },
      view_count: {
        type: Sequelize.INTEGER
      },
      created_at: {
        type: Sequelize.DATEONLY,
        defaultValue: Sequelize.fn('now')
      }
    });
    return Properties;
  };