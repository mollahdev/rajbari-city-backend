'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'BloodDonors',
            {
                user_id: {
                    type: Sequelize.UUID,
                    primaryKey: true,
                    allowNull: false,
                    references: {
                        model: 'Users',
                        key: 'id',
                    },
                    onDelete: 'CASCADE',
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
                description: Sequelize.TEXT,
                is_active: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: true,
                    allowNull: false
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

        await queryInterface.addIndex('BloodDonors', ['blood_group'], {
            name: 'blood_donor_blood_group_index',
        })

        await queryInterface.addIndex('BloodDonors', ['is_active'], {
            name: 'blood_donor_is_active_index',
        })
    },

    async down(queryInterface, Sequelize) {
        // Removing indexes before dropping the table
        await queryInterface.removeIndex(
            'BloodDonors',
            'blood_donor_blood_group_index'
        )
        await queryInterface.removeIndex(
            'BloodDonors',
            'blood_donor_is_active_index'
        )
        await queryInterface.dropTable('BloodDonors')
    },
}
