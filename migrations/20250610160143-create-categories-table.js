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
                slug: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    unique: true,
                },
                name: {
                    type: Sequelize.STRING,
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

        // Optional: explicitly add index (already handled by `unique: true` on slug)
        await queryInterface.addIndex('Categories', ['slug'], {
            name: 'category_slug_index',
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('Categories', 'category_slug_index')
        await queryInterface.dropTable('Categories')
    },
}
