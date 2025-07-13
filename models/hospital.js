'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class Hospital extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Hospital.hasMany(models.HospitalService, {
                foreignKey: 'hospital_id',
                as: 'services',
            })

            Hospital.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'owner',
            })
        }
    }

    Hospital.init(
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
            thumbnailUrl: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            mobiles: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: [],
            },
            socials: {
                type: DataTypes.JSON,
                defaultValue: [],
            },
            district: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            upazila: DataTypes.STRING,
            union: DataTypes.STRING,
            isMunicipality: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            municipality: DataTypes.STRING,
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            isVerified: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            isPartner: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            isAlwaysOpen: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            googleMapUrl: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            address: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM(
                    'active',
                    'inactive',
                    'pending',
                    'blocked'
                ),
                defaultValue: 'active',
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Hospital',
            tableName: 'Hospitals',
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            timestamps: true,
            underscored: true,
            indexes: [
                {
                    fields: ['user_id'],
                    name: 'hospital_user_id_index',
                },
                {
                    fields: ['district'],
                    name: 'hospital_district_index',
                },
                {
                    fields: ['upazila'],
                    name: 'hospital_upazila_index',
                },
                {
                    fields: ['union'],
                    name: 'hospital_union_index',
                },
                {
                    fields: ['municipality'],
                    name: 'hospital_municipality_index',
                },
                {
                    fields: ['status'],
                    name: 'hospital_status_index',
                },
            ],
        }
    )

    Hospital.afterDestroy(async (data, options) => {
        await sequelize.models.Doctor.destroy({
            where: { location: data.id },
        })

        await sequelize.models.BloodRequest.destroy({
            where: { location: data.id },
        })
    })

    return Hospital
}
