'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class BloodFoundationUser extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    BloodFoundationUser.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4, // Ensures automatic UUID generation
                primaryKey: true,
                allowNull: false,
            },
            userId: {
                type: DataTypes.UUID,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                allowNull: false,
            },
            foundationId: {
                type: DataTypes.UUID,
                references: {
                    model: 'BloodFoundations',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                allowNull: false,
            },
            role: {
                type: DataTypes.ENUM('admin', 'member'),
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
            modelName: 'BloodFoundationUser',
            tableName: 'BloodFoundationUsers',
            timestamps: true,
            underscored: true,
            indexes: [
                {
                    fields: ['user_id', 'foundation_id'],
                    name: 'blood_foundation_user_id_foundation_id_index',
                },
                {
                    fields: ['foundation_id'],
                    name: 'blood_foundation_user_foundation_id_index',
                }
            ],
        }
    )

    return BloodFoundationUser
}
