'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class Device extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Device.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'devices',
            })
        }
    }

    Device.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            token: {
                unique: true,
                type: DataTypes.STRING,
                allowNull: false,
            },
            platformType: {
                type: DataTypes.ENUM('ios', 'android', 'web'),
                allowNull: false,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Device',
            tableName: 'Devices',
            timestamps: true,
            underscored: true,
            indexes: [
                {
                    fields: ['platform_type'],
                    name: 'device_platform_type_index',
                },
            ],
        }
    )

    return Device
}
