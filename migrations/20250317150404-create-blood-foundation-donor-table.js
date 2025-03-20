'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'BloodFoundationDonors',
            {
                id: {
                    type: Sequelize.UUID, // Ensures UUID type
                    defaultValue: Sequelize.UUIDV4, // Generates UUID automatically
                    primaryKey: true,
                    allowNull: false,
                },
                foundation_id: {
                    type: Sequelize.UUID,
                    references: {
                        model: 'BloodFoundations',
                        key: 'id',
                    },
                    onDelete: 'CASCADE',
                    allowNull: false,
                },
                name: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                mobile: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                dial_code: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    defaultValue: '880',
                },
                blood_group: {
                    type: Sequelize.ENUM(
                        'A+',
                        'A-',
                        'B+',
                        'B-',
                        'AB+',
                        'AB-',
                        'O+',
                        'O-'
                    ),
                    allowNull: false,
                },
                dob: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                gender: {
                    type: Sequelize.ENUM('male', 'female'),
                    allowNull: false,
                },
                district: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                upazila: Sequelize.STRING,
                union: Sequelize.STRING,
                is_municipality: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false,
                    allowNull: false,
                },
                municipality: Sequelize.STRING,
                profile_picture_url: Sequelize.STRING,
                description: Sequelize.TEXT,
                status: {
                    type: Sequelize.ENUM(
                        'active',
                        'inactive',
                        'pending',
                        'blocked'
                    ),
                    defaultValue: 'active',
                    allowNull: false,
                },
                last_donated_at: Sequelize.DATE,
                created_at: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
                updated_at: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
            },
            {
                charset: 'utf8mb4',
                collate: 'utf8mb4_unicode_ci',
                timestamps: true,
            }
        )

        await queryInterface.addIndex(
            'BloodFoundationDonors',
            ['foundation_id'],
            {
                name: 'blood_foundation_donor_foundation_id_index',
            }
        )
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex(
            'BloodFoundationDonors',
            'blood_foundation_donor_foundation_id_index'
        )
        await queryInterface.dropTable('BloodFoundationDonors')
    },
}
