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
                defaultValue: DataTypes.UUIDV4, // Ensures automatic UUID generation
                primaryKey: true,
                allowNull: false,
            },
            token: {
                unique: true,
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
            timestamps: true,
            underscored: true,
            indexes: [
                {
                    fields: ['user_id'],
                    name: 'token_user_id_index',
                },
                {
                    fields: ['expires_at'],
                    name: 'token_expires_at_index',
                },
            ],
        }
    )

    return Token
}
