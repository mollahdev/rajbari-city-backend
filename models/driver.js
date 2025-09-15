'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class Driver extends Model {
        static associate(models) {
            Driver.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'driver',
            })
        }
    }

    Driver.init(
        {
            userId: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false, // Ensures it's always provided
                references: {
                    model: 'Users', // Assuming the Users table exists
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            experience: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            licenseNumber: {
                type: DataTypes.STRING,
                allowNull: false, // Ensures it's always provided
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true, // Default to true if not provided
            },
        },
        {
            sequelize,
            modelName: 'Driver',
            tableName: 'Drivers',
            timestamps: true,
            underscored: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
        }
    )

    Driver.afterDestroy(async (data, options) => {
        await sequelize.models.Vehicle.destroy({
            where: { userId: data.userId },
        })
    })

    return Driver
}
