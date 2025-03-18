'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class BloodDonor extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            BloodDonor.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'donor',
            })
        }
    }

    BloodDonor.init(
        {
            userId: {
                type: DataTypes.UUID,
                unique: true,
                primaryKey: true,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            bloodGroup: {
                allowNull: false,
                type: DataTypes.ENUM(
                    'A+',
                    'A-',
                    'B+',
                    'B-',
                    'AB+',
                    'AB-',
                    'O+',
                    'O-'
                ),
            },
            description: DataTypes.TEXT,
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            lastDonatedAt: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: 'BloodDonor',
            tableName: 'BloodDonors',
            timestamps: true,
            underscored: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            indexes: [
                {
                    fields: ['blood_group'],
                    name: 'blood_donor_blood_group_index',
                },
                {
                    fields: ['is_active'],
                    name: 'blood_donor_is_active_index',
                },
            ],
        }
    )

    BloodDonor.afterDestroy(async (data, options) => {
        await sequelize.models.BloodFoundationUser.destroy({
            where: { userId: data.userId },
        })
    })

    return BloodDonor
}
