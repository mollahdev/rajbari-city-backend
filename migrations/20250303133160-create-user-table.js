'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Users', {
            id: {
                type: Sequelize.UUID, // Ensures UUID type
                defaultValue: Sequelize.UUIDV4, // Generates UUID automatically
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING,
                collate: 'utf8mb4_unicode_ci'
            },
            mobile: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true, // Ensures unique mobile numbers
                validate: {
                    is: /^[0-9]{10}$/, // Ensures exactly 10 digits
                },
            },
            dial_code: {
                type: Sequelize.ENUM('880'), // Restricts to only '880'
                allowNull: false,
            },
            password: Sequelize.STRING,
            dob: Sequelize.DATE,
            gender: Sequelize.ENUM(['male', 'female']),
            district: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            upazila: Sequelize.STRING,
            union: Sequelize.STRING,
            is_municipality: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            municipality: Sequelize.STRING,
            otp: Sequelize.STRING,
            otp_created_at: Sequelize.DATE,
            profile_picture_url: Sequelize.STRING,
            is_verified: Sequelize.BOOLEAN,
            is_onboarded: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
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
        await queryInterface.dropTable('Users')
    },
}
