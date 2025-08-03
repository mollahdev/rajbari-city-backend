'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class UserRole extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            UserRole.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user',
            })
        }
    }
    UserRole.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4, // Ensures automatic UUID generation
                primaryKey: true,
                allowNull: false,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'Users', // Name of the target model
                    key: 'id', // Key in the target model
                },
                onDelete: 'CASCADE',
            },
            createdBy: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'Users', // Name of the target model
                    key: 'id', // Key in the target model
                },
                onDelete: 'SET NULL',
            },
            organizationId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            role: {
                type: DataTypes.ENUM(
                    'owner',
                    'admin',
                    'editor',
                    'user',
                    'guest'
                ),
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM(
                    'active',
                    'pending',
                    'rejected',
                    'inactive'
                ),
                allowNull: false,
                defaultValue: 'pending',
            },
        },
        {
            sequelize,
            modelName: 'UserRole',
            tableName: 'UserRoles',
            timestamps: true,
            underscored: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
        }
    )

    return UserRole
}
