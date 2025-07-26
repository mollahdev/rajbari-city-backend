'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class Token extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    Token.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            token: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            isValid: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            expiresAt: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: 'Token',
            tableName: 'Tokens',
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            timestamps: true,
            underscored: true,
            indexes: [
                {
                    fields: ['user_id'],
                    name: 'token_user_id_index',
                },
            ],
        }
    )

    return Token
}
