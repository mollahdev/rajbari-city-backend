'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class BloodRequest extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            BloodRequest.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'bloodRequest',
            })
        }
    }

    BloodRequest.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            userId: {
                type: DataTypes.UUID,
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
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    min: 1,
                },
            },
            problem: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            dialCode: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            mobile: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            district: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            locationType: {
                type: DataTypes.ENUM('hospital', 'diagnostic', 'other'),
                allowNull: false,
            },
            location: {
                type: DataTypes.STRING,
            },
            date: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            description: DataTypes.TEXT,
        },
        {
            sequelize,
            modelName: 'BloodRequest',
            tableName: 'BloodRequests',
            timestamps: true,
            underscored: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            indexes: [
                {
                    fields: ['blood_group'],
                    name: 'blood_request_blood_group_index',
                },
                {
                    fields: ['district'],
                    name: 'blood_request_district_index',
                },
            ],
        }
    )

    return BloodRequest
}
