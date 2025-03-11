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
            name: Sequelize.STRING,
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
            gender: Sequelize.STRING,
            district: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            thana: Sequelize.STRING,
            upazila: Sequelize.STRING,
            union: Sequelize.STRING,
            otp: Sequelize.STRING,
            otp_created_at: Sequelize.DATE,
            profile_picture_id: Sequelize.STRING,
            is_verified: Sequelize.BOOLEAN,
            verified_at: Sequelize.DATE,
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
