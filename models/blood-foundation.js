'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class BloodFoundation extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            BloodFoundation.belongsToMany(models.User, {
                through: models.BloodFoundationUser,
                foreignKey: 'foundation_id',
                as: 'members',
            })

            BloodFoundation.hasMany(models.BloodFoundationDonor, {
                foreignKey: 'foundation_id',
                as: 'donors',
            })

            BloodFoundation.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'owner',
            })
        }
    }

    BloodFoundation.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4, // Ensures automatic UUID generation
                primaryKey: true,
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
            modelName: 'BloodFoundation',
            tableName: 'BloodFoundations',
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            timestamps: true,
            underscored: true,
            indexes: [
                {
                    fields: ['user_id'],
                    name: 'blood_foundation_user_id_index',
                },
                {
                    fields: ['district'],
                    name: 'blood_foundation_district_index',
                },
                {
                    fields: ['upazila'],
                    name: 'blood_foundation_upazila_index',
                },
                {
                    fields: ['union'],
                    name: 'blood_foundation_union_index',
                },
                {
                    fields: ['municipality'],
                    name: 'blood_foundation_municipality_index',
                },
                {
                    fields: ['status'],
                    name: 'blood_foundation_status_index',
                },
            ],
        }
    )

    return BloodFoundation
}
