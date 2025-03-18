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

        await queryInterface.addIndex('BloodFoundationDonors', ['mobile'], {
            name: 'blood_foundation_donor_mobile_index',
        })

        await queryInterface.addIndex(
            'BloodFoundationDonors',
            ['foundation_id'],
            {
                name: 'blood_foundation_donor_foundation_id_index',
            }
        )

        await queryInterface.addIndex(
            'BloodFoundationDonors',
            ['blood_group'],
            {
                name: 'blood_foundation_donor_blood_group_index',
            }
        )

        await queryInterface.addIndex('BloodFoundationDonors', ['status'], {
            name: 'blood_foundation_donor_status_index',
        })

        await queryInterface.addIndex('BloodFoundationDonors', ['district'], {
            name: 'blood_foundation_donor_district_index',
        })

        await queryInterface.addIndex('BloodFoundationDonors', ['upazila'], {
            name: 'blood_foundation_donor_upazila_index',
        })

        await queryInterface.addIndex('BloodFoundationDonors', ['union'], {
            name: 'blood_foundation_donor_union_index',
        })

        await queryInterface.addIndex(
            'BloodFoundationDonors',
            ['municipality'],
            {
                name: 'blood_foundation_donor_municipality_index',
            }
        )

        await queryInterface.addIndex(
            'BloodFoundationDonors',
            ['last_donated_at'],
            {
                name: 'blood_foundation_donor_last_donated_at_index',
            }
        )
    },

    async down(queryInterface, Sequelize) {
        // Removing indexes before dropping the table
        await queryInterface.removeIndex(
            'BloodFoundationDonors',
            'blood_foundation_donor_mobile_index'
        )
        await queryInterface.removeIndex(
            'BloodFoundationDonors',
            'blood_foundation_donor_foundation_id_index'
        )
        await queryInterface.removeIndex(
            'BloodFoundationDonors',
            'blood_foundation_donor_blood_group_index'
        )
        await queryInterface.removeIndex(
            'BloodFoundationDonors',
            'blood_foundation_donor_status_index'
        )
        await queryInterface.removeIndex(
            'BloodFoundationDonors',
            'blood_foundation_donor_district_index'
        )
        await queryInterface.removeIndex(
            'BloodFoundationDonors',
            'blood_foundation_donor_upazila_index'
        )
        await queryInterface.removeIndex(
            'BloodFoundationDonors',
            'blood_foundation_donor_union_index'
        )
        await queryInterface.removeIndex(
            'BloodFoundationDonors',
            'blood_foundation_donor_municipality_index'
        )
        await queryInterface.removeIndex(
            'BloodFoundationDonors',
            'blood_foundation_donor_last_donated_at_index'
        )
        await queryInterface.dropTable('BloodFoundationDonors')
    },
}
