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
            mobile_number: DataTypes.STRING,
            password: DataTypes.STRING,
            date_of_birth: DataTypes.DATE,
            gender: DataTypes.STRING,
            thana: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'User',
        }
    )
    return User
}
