'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'Users',
            {
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
                },
                dial_code: {
                    type: Sequelize.STRING, // Restricts to only '880'
                    allowNull: false,
                    defaultValue: '880',
                },
                password: Sequelize.STRING,
                dob: Sequelize.DATE,
                gender: Sequelize.ENUM('male', 'female'),
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
            },
            {
                timestamps: true,
                charset: 'utf8mb4',
                collate: 'utf8mb4_unicode_ci',
            }
        )

        await queryInterface.addIndex('Users', ['district'], {
            name: 'user_district_index',
        })

        await queryInterface.addIndex('Users', ['upazila'], {
            name: 'user_upazila_index',
        })

        await queryInterface.addIndex('Users', ['union'], {
            name: 'user_union_index',
        })

        await queryInterface.addIndex('Users', ['municipality'], {
            name: 'user_municipality_index',
        })
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('Users', 'user_district_index')
        await queryInterface.removeIndex('Users', 'user_upazila_index')
        await queryInterface.removeIndex('Users', 'user_union_index')
        await queryInterface.removeIndex('Users', 'user_municipality_index')

        await queryInterface.dropTable('Users')
    },
}
