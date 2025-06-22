'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class Category extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Category.hasMany(models.Service, {
                foreignKey: 'categoryId',
                as: 'services',
            })
        }
    }

    Category.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4, // Ensures automatic UUID generation
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            group: {
                type: DataTypes.STRING,
                defaultValue: 'general',
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Category',
            tableName: 'Categories',
            timestamps: true,
            underscored: true,
        }
    )

    return Category
}
