'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class HospitalService extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            HospitalService.belongsTo(models.Hospital, {
                foreignKey: 'hospital_id',
                as: 'services',
            })

            HospitalService.belongsTo(models.Service, {
                foreignKey: 'service_id',
                as: 'service',
            })
        }
    }

    HospitalService.init(
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                unique: true,
                defaultValue: DataTypes.UUIDV4,
            },
            hospitalId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'Hospitals',
                    key: 'id',
                },
                onDelete: 'CASCADE',
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
            modelName: 'HospitalService',
            tableName: 'HospitalServices',
            timestamps: true,
            underscored: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
        }
    )

    return HospitalService
}
