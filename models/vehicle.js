'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class Vehicle extends Model {
        static associate(models) {
            Vehicle.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'vehicles',
            })
        }
    }

    Vehicle.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4, // Ensures automatic UUID generation
                primaryKey: true,
                allowNull: false,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false, // Ensures it's always provided
                references: {
                    model: 'Users', // Assuming the Users table exists
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            type: {
                type: DataTypes.ENUM('car', 'truck'),
                allowNull: false,
            },
            model: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            size: { type: DataTypes.STRING, allowNull: false },
            upazila: { type: DataTypes.STRING, allowNull: false },
            address: { type: DataTypes.STRING, allowNull: false },
            description: { type: DataTypes.TEXT, allowNull: true },
            image: { type: DataTypes.STRING, allowNull: true },
        },
        {
            sequelize,
            modelName: 'Vehicle',
            tableName: 'Vehicles',
            timestamps: true,
            underscored: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
        }
    )

    return Vehicle
}
