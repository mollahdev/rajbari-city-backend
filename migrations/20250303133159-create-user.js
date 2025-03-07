'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                allowNull: true,
                type: Sequelize.STRING,
            },
            mobileNumber: {
                type: Sequelize.STRING,
            },
            password: {
                allowNull: true,
                type: Sequelize.STRING,
            },
            dateOfBirth: {
                allowNull: true,
                type: Sequelize.DATE,
            },
            gender: {
                allowNull: true,
                type: Sequelize.STRING,
            },
            thana: {
                allowNull: true,
                type: Sequelize.STRING,
            },
            otp: {
                allowNull: true,
                type: Sequelize.INTEGER,
            },
            otpCreatedAt: {
                allowNull: true,
                type: Sequelize.DATE,
            },
            isVerified: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            verifiedAt: {
                allowNull: true,
                type: Sequelize.DATE,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        })
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Users')
    },
}
