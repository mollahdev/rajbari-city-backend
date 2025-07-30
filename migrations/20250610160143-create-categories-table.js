'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'Categories',
            {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    primaryKey: true,
                    allowNull: false,
                },
                name: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                group: {
                    type: Sequelize.STRING,
                    defaultValue: 'general',
                    allowNull: false,
                },
                icon: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                description: {
                    type: Sequelize.STRING,
                    allowNull: true,
                    validate: {
                        len: [0, 200], // Maximum length of 200 characters
                    },
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
        await queryInterface.dropTable('Categories')
    },
}
