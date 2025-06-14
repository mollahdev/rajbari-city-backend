'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class Service extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Service.belongsTo(models.Category, {
                foreignKey: 'categoryId',
                as: 'category',
            })
        }
    }

    Service.init(
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
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            categoryId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'Categories',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
        },
        {
            sequelize,
            modelName: 'Service',
            tableName: 'Services',
            timestamps: true,
            underscored: true,
        }
    )

    return Service
}
