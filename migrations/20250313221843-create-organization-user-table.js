'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'OrganizationUsers',
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
                    allowNull: false,
                },
                organization_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                },
                role: {
                    type: Sequelize.ENUM('admin', 'member', 'owner'),
                    defaultValue: 'member',
                    allowNull: false,
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

        await queryInterface.addIndex('OrganizationUsers', ['user_id'], {
            name: 'organization_user_user_id_index',
        })

        await queryInterface.addIndex(
            'OrganizationUsers',
            ['organization_id'],
            {
                name: 'organization_user_organization_id_index',
            }
        )
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex(
            'OrganizationUsers',
            'organization_user_user_id_index'
        )

        await queryInterface.removeIndex(
            'OrganizationUsers',
            'organization_user_organization_id_index'
        )

        await queryInterface.dropTable('OrganizationUsers')
    },
}
