'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Fetch DirectoryTypes to get their IDs
        const directoryTypes = await queryInterface.sequelize.query(
            `SELECT id FROM DirectoryTypes;`
        )

        const directoryTypeRows = directoryTypes[0]

        await queryInterface.bulkInsert(
            'Categories',
            [
                {
                    name: 'মনোরোগ বিশেষজ্ঞ',
                    directoryTypeId: directoryTypeRows[0].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    name: 'রসায়ন',
                    directoryTypeId: directoryTypeRows[1].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    name: 'ইলেকট্রিশিয়ান',
                    directoryTypeId: directoryTypeRows[2].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
            {}
        )
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('Categories', null, {})
    },
}
