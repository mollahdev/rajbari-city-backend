'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('BloodFoundations', {
            id: {
                type: Sequelize.UUID, // Ensures UUID type
                defaultValue: Sequelize.UUIDV4, // Generates UUID automatically
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            thumbnail_url: {
                type: Sequelize.STRING,
            },
            description: {
                type: Sequelize.STRING,
            },
            mobiles: {
                type: Sequelize.JSON,
                allowNull: false,
            },
            socials: {
                type: Sequelize.JSON,
            },
            district: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            upazila: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            union: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
            },
            is_verified: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            is_partner: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM('active', 'inactive', 'pending'),
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
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('BloodFoundations')
    },
}
