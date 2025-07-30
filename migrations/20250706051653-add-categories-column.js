'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.addColumn('Categories', 'icon', {
            type: Sequelize.STRING,
            allowNull: true,
        })

        queryInterface.addColumn('Categories', 'description', {
            type: Sequelize.STRING,
            allowNull: true,
            validate: {
                len: [0, 200], // Maximum length of 200 characters
            },
        })
    },

    async down(queryInterface, Sequelize) {
        queryInterface.removeColumn('Categories', 'icon')
        queryInterface.removeColumn('Categories', 'description')
    },
}
