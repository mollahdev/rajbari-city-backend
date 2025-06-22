'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'DiagnosticServices',
            {
                id: {
                    type: Sequelize.UUID,
                    primaryKey: true,
                    allowNull: false,
                    unique: true,
                    defaultValue: Sequelize.UUIDV4,
                },
                diagnostic_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: {
                        model: 'Diagnostics',
                        key: 'id',
                    },
                    onDelete: 'CASCADE',
                },
                service_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: {
                        model: 'Services',
                        key: 'id',
                    },
                    onDelete: 'CASCADE',
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
        await queryInterface.dropTable('DiagnosticServices')
    },
}
