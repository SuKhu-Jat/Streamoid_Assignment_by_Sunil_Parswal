const { Sequelize, DataTypes, Op } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite',
    logging: false, 
});

const Product = sequelize.define('Product', {
    sku: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    brand: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    color: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    size: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    mrp: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

module.exports = {
    sequelize,
    Product,
    Op,
};
