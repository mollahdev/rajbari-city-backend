'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'BloodRequests',
            {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    primaryKey: true,
                    allowNull: false,
                },
                user_id: {
                    type: Sequelize.UUID,
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
                quantity: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    validate: {
                        min: 1,
                    },
                },
                problem: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                dial_code: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                mobile: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                district: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                location_type: {
                    type: Sequelize.ENUM('hospital', 'diagnostic', 'other'),
                    allowNull: false,
                },
                location: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                date: {
                    type: Sequelize.DATE,
                    allowNull: true,
                },
                description: Sequelize.TEXT,
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

        await queryInterface.addIndex('BloodRequests', ['blood_group'], {
            name: 'blood_request_blood_group_index',
        })

        await queryInterface.addIndex('BloodRequests', ['district'], {
            name: 'blood_request_district_index',
        })
    },

    async down(queryInterface, Sequelize) {
        // Removing indexes before dropping the table
        await queryInterface.removeIndex(
            'BloodRequests',
            'blood_request_blood_group_index'
        )
        await queryInterface.removeIndex(
            'BloodRequests',
            'blood_request_district_index'
        )
        await queryInterface.dropTable('BloodRequests')
    },
}
