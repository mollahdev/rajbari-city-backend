'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class OrganizationUser extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            OrganizationUser.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'organizationMembers',
            })
        }
    }

    OrganizationUser.init(
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                unique: true,
                defaultValue: DataTypes.UUIDV4,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'User',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            organizationId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            role: {
                type: DataTypes.ENUM('admin', 'member', 'owner'),
                defaultValue: 'member',
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM(
                    'active',
                    'inactive',
                    'blocked',
                    'pending'
                ),
                defaultValue: 'pending',
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'OrganizationUser',
            tableName: 'OrganizationUsers',
            timestamps: true,
            underscored: true,
            indexes: [
                {
                    fields: ['user_id'],
                    name: 'organization_user_user_id_index',
                },
                {
                    fields: ['organization_id'],
                    name: 'organization_user_organization_id_index',
                },
            ],
        }
    )

    return OrganizationUser
}
