'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'Vehicles',
            {
                id: {
                    type: Sequelize.UUID,
                    primaryKey: true,
                    allowNull: false,
                    defaultValue: Sequelize.UUIDV4,
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
                type: {
                    type: Sequelize.ENUM('car', 'truck'),
                    allowNull: false,
                },
                model: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                size: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                upazila: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                address: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                description: {
                    type: Sequelize.TEXT,
                    allowNull: true,
                },
                image: {
                    type: Sequelize.STRING,
                    allowNull: true,
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
        await queryInterface.dropTable('Vehicles')
    },
}
