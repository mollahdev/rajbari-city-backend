'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'Tokens',
            {
                id: {
                    type: Sequelize.UUID, // Ensures UUID type
                    defaultValue: Sequelize.UUIDV4, // Generates UUID automatically
                    primaryKey: true,
                    allowNull: false,
                },
                token: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                user_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                },
                is_valid: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false,
                    allowNull: false,
                },
                expires_at: Sequelize.DATE,
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

        await queryInterface.addIndex('Tokens', ['user_id'], {
            name: 'tokens_user_id_index',
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('Tokens', 'tokens_user_id_index')
        await queryInterface.dropTable('Tokens')
    },
}
