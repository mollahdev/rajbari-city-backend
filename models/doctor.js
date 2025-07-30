'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class Doctor extends Model {
        static associate(models) {
            Doctor.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'doctors',
            })
        }
    }

    Doctor.init(
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
            bmdcNumber: {
                type: DataTypes.STRING,
                allowNull: false, // Ensures it's always provided
            },
            categoryIds: {
                type: DataTypes.JSON,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            education: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            mobile: {
                type: DataTypes.STRING,
                allowNull: false, // Ensures it's always provided
                validate: {
                    is: /^[0-9]{10}$/, // Ensures exactly 10 digits
                },
            },
            dialCode: {
                type: DataTypes.STRING, // Restrict to only '880'
                allowNull: false, // Ensures it's always provided
                defaultValue: '880', // Ensures it's always '880'
            },
            gender: {
                type: DataTypes.ENUM('male', 'female'),
                allowNull: false,
            },
            district: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            locationType: {
                type: DataTypes.ENUM('hospital', 'diagnostic', 'other'),
                allowNull: false,
            },
            location: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            profilePictureUrl: DataTypes.STRING,
            description: DataTypes.TEXT,
            status: {
                type: DataTypes.ENUM(
                    'active',
                    'inactive',
                    'blocked',
                    'pending'
                ),
                defaultValue: 'active',
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Doctor',
            tableName: 'Doctors',
            timestamps: true,
            underscored: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            indexes: [
                {
                    fields: ['bmdc_number'],
                    name: 'bmdc_number_index',
                },
            ],
        }
    )

    return Doctor
}
