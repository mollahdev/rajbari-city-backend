'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('BloodFoundationUsers', {
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
            blood_foundation_id: {
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
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('BloodFoundationUsers')
    },
}
