'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'BloodFoundationUsers',
            {
                id: {
                    type: Sequelize.UUID, // Ensures UUID type
                    defaultValue: Sequelize.UUIDV4, // Generates UUID automatically
                    primaryKey: true,
                    allowNull: false,
                },
                user_id: {
                    type: Sequelize.UUID,
                    references: {
                        model: 'Users',
                        key: 'id',
                    },
                    onDelete: 'CASCADE',
                },
                foundation_id: {
                    type: Sequelize.UUID,
                    references: {
                        model: 'BloodFoundations',
                        key: 'id',
                    },
                    onDelete: 'CASCADE',
                },
                role: {
                    type: Sequelize.ENUM('admin', 'member'),
                    defaultValue: 'member',
                },
                status: {
                    type: Sequelize.ENUM(
                        'active',
                        'inactive',
                        'pending',
                        'blocked'
                    ),
                    defaultValue: 'pending',
                    allowNull: false,
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
                timestamps: true,
                charset: 'utf8mb4',
                collate: 'utf8mb4_unicode_ci',
            }
        )
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('BloodFoundationUsers')
    },
}
