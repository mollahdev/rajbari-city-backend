'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            User.belongsToMany(models.BloodFoundation, {
                through: models.BloodFoundationUser,
                foreignKey: 'user_id',
                as: 'bloodFoundations',
            })

            User.hasOne(models.BloodDonor, {
                foreignKey: 'user_id',
                as: 'bloodDonor',
            })

            User.hasMany(models.BloodFoundation, {
                foreignKey: 'user_id',
                as: 'ownedBloodFoundations',
            })
        }
    }
    User.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4, // Ensures automatic UUID generation
                primaryKey: true,
            },
            name: DataTypes.STRING,
            mobile: {
                type: DataTypes.STRING,
                allowNull: false, // Ensures it's always provided
                unique: true, // Ensures it's always unique
                validate: {
                    is: /^[0-9]{10}$/, // Ensures exactly 10 digits
                },
            },
            dialCode: {
                type: DataTypes.STRING, // Restrict to only '880'
                allowNull: false, // Ensures it's always provided
                defaultValue: '880', // Sets default value to '880'
            },
            password: DataTypes.STRING,
            dob: DataTypes.DATE,
            gender: DataTypes.ENUM('male', 'female'),
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
            otp: DataTypes.STRING,
            otpCreatedAt: DataTypes.DATE,
            profilePictureUrl: DataTypes.STRING,
            isVerified: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            isOnboarded: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            sequelize,
            modelName: 'User',
            tableName: 'Users',
            timestamps: true,
            underscored: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            indexes: [
                {
                    fields: ['district'],
                    name: 'user_district_index',
                },
                {
                    fields: ['upazila'],
                    name: 'user_upazila_index',
                },
                {
                    fields: ['union'],
                    name: 'user_union_index',
                },
                {
                    fields: ['municipality'],
                    name: 'user_municipality_index',
                },
            ],
        }
    )
    return User
}
