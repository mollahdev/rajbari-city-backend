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
        }
    }

    HospitalService.init(
        {
            hospitalId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            serviceId: {
                type: DataTypes.UUID,
                allowNull: false,
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
