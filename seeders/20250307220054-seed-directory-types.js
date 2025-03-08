'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert(
            'DirectoryTypes',
            [
                {
                    name: 'বিশেষজ্ঞ',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    name: 'শিক্ষক',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    name: 'মিস্ত্রি',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
            {}
        )
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('DirectoryTypes', null, {})
    },
}
