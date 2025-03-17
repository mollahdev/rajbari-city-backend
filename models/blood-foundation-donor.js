'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class BloodFoundationDonor extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            BloodFoundationDonor.belongsTo(models.BloodFoundation, {
                foreignKey: 'foundation_id',
                as: 'foundation',
            })
        }
    }

    BloodFoundationDonor.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4, // Ensures automatic UUID generation
                primaryKey: true,
                allowNull: false,
            },
            foundationId: {
                type: DataTypes.UUID,
                references: {
                    model: 'BloodFoundations',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            mobile: {
                type: DataTypes.STRING,
                allowNull: false, // Ensures it's always provided
                validate: {
                    is: /^[0-9]{10}$/, // Ensures exactly 10 digits
                },
            },
            dialCode: {
                type: DataTypes.STRING, // Restrict to only '880'
                allowNull: false, // Ensures it's always provided
                defaultValue: '880', // Ensures it's always '880'
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
            dob: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            gender: {
                type: DataTypes.ENUM('male', 'female'),
                allowNull: false,
            },
            district: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            upazila: DataTypes.STRING,
            union: DataTypes.STRING,
            isMunicipality: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            municipality: DataTypes.STRING,
            profilePictureUrl: DataTypes.STRING,
            description: DataTypes.TEXT,
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            lastDonatedAt: DataTypes.DATE
        },
        {
            sequelize,
            modelName: 'BloodFoundationDonor',
            tableName: 'BloodFoundationDonors',
            timestamps: true,
            underscored: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            indexes: [
                {
                    fields: ['mobile'],
                    name: 'blood_foundation_donor_mobile_index',
                },
                {
                    fields: ['foundation_id'],
                    name: 'blood_foundation_donor_foundation_id_index',
                },
                {
                    fields: ['blood_group'],
                    name: 'blood_foundation_donor_blood_group_index',
                },
                {
                    fields: ['is_active'],
                    name: 'blood_foundation_donor_is_active_index',
                },
                {
                    fields: ['district'],
                    name: 'blood_foundation_donor_district_index',
                },
                {
                    fields: ['upazila'],
                    name: 'blood_foundation_donor_upazila_index',
                },
                {
                    fields: ['union'],
                    name: 'blood_foundation_donor_union_index',
                },
                {
                    fields: ['municipality'],
                    name: 'blood_foundation_donor_municipality_index',
                },
                {
                    fields: ['last_donated_at'],
                    name: 'blood_foundation_donor_last_donated_at_index',
                },
            ],
        }
    )

    return BloodFoundationDonor
}
