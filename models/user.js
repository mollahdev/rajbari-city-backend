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
            name: DataTypes.STRING,
            mobileNumber: DataTypes.STRING,
            password: DataTypes.STRING,
            dateOfBirth: DataTypes.DATE,
            gender: DataTypes.STRING,
            thana: DataTypes.STRING,
            otp: DataTypes.INTEGER,
            otpCreatedAt: DataTypes.DATE,
            isVerified: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            verifiedAt: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: 'User',
        }
    )
    return User
}
