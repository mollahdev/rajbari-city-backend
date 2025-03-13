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
            },
            userId: {
                type: DataTypes.UUID,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            bloodFoundationId: {
                type: DataTypes.UUID,
                references: {
                    model: 'BloodFoundations',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            role: {
                type: DataTypes.ENUM('admin', 'member'),
                defaultValue: 'member',
            },
        },
        {
            sequelize,
            modelName: 'BloodFoundationUser',
            tableName: 'BloodFoundationUsers',
            timestamps: true,
            underscored: true,
        }
    )

    return BloodFoundationUser
}
