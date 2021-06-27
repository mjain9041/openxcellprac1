module.exports = (sequelize, Sequelize) => {
    const BASE_URL = process.env.BASE_URL || 'http://localhost:8080/'
    const RecentProducts = sequelize.define("recent_products", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        property_id: {
            type: Sequelize.STRING
        },
        last_visited: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.fn('now')
        },
    });
    return RecentProducts;
};