'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Fetch Categories and DirectoryTypes to get their IDs
        const categories = await queryInterface.sequelize.query(
            `SELECT id FROM Categories;`
        )
        const directoryTypes = await queryInterface.sequelize.query(
            `SELECT id FROM DirectoryTypes;`
        )

        const categoryRows = categories[0]
        const directoryTypeRows = directoryTypes[0]

        await queryInterface.bulkInsert(
            'Listings',
            [
                {
                    title: 'Tech Store',
                    description: 'Best gadgets and accessories',
                    categoryId: categoryRows[0].id,
                    directoryTypeId: directoryTypeRows[0].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Health Clinic',
                    description: 'Specialized in holistic treatments',
                    categoryId: categoryRows[1].id,
                    directoryTypeId: directoryTypeRows[1].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Investment Firm',
                    description: 'Financial planning and investment strategies',
                    categoryId: categoryRows[2].id,
                    directoryTypeId: directoryTypeRows[2].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
            {}
        )
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('Listings', null, {})
    },
}
