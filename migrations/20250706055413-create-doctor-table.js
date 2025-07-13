'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'Doctors',
            {
                id: {
                    type: Sequelize.UUID, // Ensures UUID type
                    defaultValue: Sequelize.UUIDV4, // Generates UUID automatically
                    primaryKey: true,
                    allowNull: false,
                },
                user_id: {
                    type: Sequelize.UUID,
                    allowNull: false, // Ensures it's always provided
                    references: {
                        model: 'Users', // Assuming the Users table exists
                        key: 'id',
                    },
                    onDelete: 'CASCADE',
                },
                bmdc_number: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                category_ids: {
                    type: Sequelize.JSON,
                    allowNull: false,
                },
                name: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                education: {
                    type: Sequelize.TEXT,
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
                gender: {
                    type: Sequelize.ENUM('male', 'female'),
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
                    allowNull: false,
                },
                profile_picture_url: {
                    type: Sequelize.STRING,
                },
                description: {
                    type: Sequelize.TEXT,
                },
                status: {
                    type: Sequelize.ENUM(
                        'active',
                        'inactive',
                        'blocked',
                        'pending'
                    ),
                    allowNull: false,
                    defaultValue: 'active',
                },
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

        await queryInterface.addIndex('Doctors', ['bmdc_number'], {
            name: 'bmdc_number_index',
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('Doctors', 'bmdc_number_index')
        await queryInterface.dropTable('Doctors')
    },
}
