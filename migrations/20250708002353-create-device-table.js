'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'Devices',
            {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    primaryKey: true,
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
                token: {
                    unique: true,
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                platform_type: {
                    type: Sequelize.ENUM('ios', 'android', 'web'),
                    allowNull: false,
                },
                is_active: {
                    type: Sequelize.BOOLEAN,
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
                charset: 'utf8mb4',
                collate: 'utf8mb4_unicode_ci',
                timestamps: true,
            }
        )

        await queryInterface.addIndex('Devices', ['platform_type'], {
            name: 'device_platform_type_index',
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex(
            'Devices',
            'device_platform_type_index'
        )
        await queryInterface.dropTable('Devices')
    },
}
