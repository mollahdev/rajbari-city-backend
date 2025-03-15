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
                collate: 'utf8mb4_unicode_ci',
            },
            thumbnailUrl: {
                type: DataTypes.STRING,
            },
            description: {
                type: DataTypes.STRING,
                collate: 'utf8mb4_unicode_ci',
            },
            mobiles: {
                type: DataTypes.JSON,
                allowNull: false,
            },
            socials: {
                type: DataTypes.JSON,
            },
            district: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            upazila: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            union: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            isMunicipality: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            municipality: {
                type: DataTypes.STRING,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
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
                defaultValue: 'pending',
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'BloodFoundation',
            tableName: 'BloodFoundations',
            timestamps: true,
            underscored: true,
        }
    )

    return BloodFoundation
}
