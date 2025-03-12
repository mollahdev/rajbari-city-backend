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
            // define association here
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
                type: DataTypes.ENUM('880'), // Restrict to only '880'
                allowNull: false, // Ensures it's always provided
            },
            password: DataTypes.STRING,
            dob: DataTypes.DATE,
            gender: DataTypes.ENUM(['male', 'female']),
            district: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            upazila: DataTypes.STRING,
            union: DataTypes.STRING,
            otp: DataTypes.INTEGER,
            otpCreatedAt: DataTypes.DATE,
            profilePictureId: DataTypes.STRING,
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
            timestamps: true,
            underscored: true,
        }
    )
    return User
}
