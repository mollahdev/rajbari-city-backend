'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'Tokens',
            {
                token: {
                    primaryKey: true,
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
                timestamps: true,
            }
        )

        await queryInterface.addIndex('Tokens', ['expires_at'], {
            name: 'tokens_expires_at_index',
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('Tokens', 'tokens_expires_at_index')
        await queryInterface.dropTable('Tokens')
    },
}
