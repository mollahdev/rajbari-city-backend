'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'UserRoles',
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
                created_by: {
                    type: Sequelize.UUID,
                    allowNull: false,
                },
                organization_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                },
                organization_type: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                role: {
                    type: Sequelize.ENUM(
                        'owner',
                        'admin',
                        'editor',
                        'user',
                        'guest'
                    ),
                    allowNull: false,
                },
                status: {
                    type: Sequelize.ENUM(
                        'active',
                        'pending',
                        'rejected',
                        'inactive'
                    ),
                    allowNull: false,
                    defaultValue: 'pending',
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
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('UserRoles')
    },
}
