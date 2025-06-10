'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class OrganizationService extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    OrganizationService.init(
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                unique: true,
                defaultValue: DataTypes.UUIDV4,
            },
            organizationId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            serviceId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'Services',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
        },
        {
            sequelize,
            modelName: 'OrganizationService',
            tableName: 'OrganizationServices',
            timestamps: true,
            underscored: true,
        }
    )

    return OrganizationService
}
