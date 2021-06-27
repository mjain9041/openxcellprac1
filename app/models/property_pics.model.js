module.exports = (sequelize, Sequelize) => {
    const BASE_URL = process.env.BASE_URL || 'http://localhost:8080/'
    const PropertyPics = sequelize.define("property_pics", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false, 
            autoIncrement: true,
            primaryKey: true,
        },
        property_id: {
            type: Sequelize.INTEGER
        },
        image_path: {
            type: Sequelize.STRING,
            get(image_path) {
                const rawValue = this.getDataValue(image_path);
                return rawValue ? `${BASE_URL}${rawValue}` : null;
            }
        },
        thumbnail_path: {
            type: Sequelize.STRING,
            get(thumbnail_path) {
                const rawValue = this.getDataValue(thumbnail_path);
                return rawValue ? `${BASE_URL}${rawValue}` : null;
            }
        }
    });
    return PropertyPics;
};