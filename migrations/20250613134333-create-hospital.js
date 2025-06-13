'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'Hospitals',
            {
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
                    allowNull: false,
                },
                description: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                },
                mobiles: {
                    type: Sequelize.JSON,
                    allowNull: false,
                    defaultValue: [],
                },
                socials: {
                    type: Sequelize.JSON,
                    defaultValue: [],
                },
                district: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                upazila: Sequelize.STRING,
                union: Sequelize.STRING,
                is_municipality: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false,
                    allowNull: false,
                },
                municipality: Sequelize.STRING,
                user_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: {
                        model: 'Users',
                        key: 'id',
                    },
                    onDelete: 'CASCADE',
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
                is_always_open: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false,
                    allowNull: false,
                },
                google_map_url: {
                    type: Sequelize.TEXT,
                    allowNull: true,
                },
                status: {
                    type: Sequelize.ENUM(
                        'active',
                        'inactive',
                        'pending',
                        'blocked'
                    ),
                    defaultValue: 'active',
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
            },
            {
                charset: 'utf8mb4',
                collate: 'utf8mb4_unicode_ci',
                timestamps: true,
            }
        )

        await queryInterface.addIndex('Hospitals', ['user_id'], {
            name: 'hospital_user_id_index',
        })

        await queryInterface.addIndex('Hospitals', ['district'], {
            name: 'hospital_district_index',
        })

        await queryInterface.addIndex('Hospitals', ['upazila'], {
            name: 'hospital_upazila_index',
        })

        await queryInterface.addIndex('Hospitals', ['union'], {
            name: 'hospital_union_index',
        })

        await queryInterface.addIndex('Hospitals', ['municipality'], {
            name: 'hospital_municipality_index',
        })

        await queryInterface.addIndex('Hospitals', ['status'], {
            name: 'hospital_status_index',
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('Hospitals', 'user_id')
        await queryInterface.removeIndex('Hospitals', 'district')
        await queryInterface.removeIndex('Hospitals', 'upazila')
        await queryInterface.removeIndex('Hospitals', 'union')
        await queryInterface.removeIndex('Hospitals', 'municipality')
        await queryInterface.removeIndex('Hospitals', 'status')

        await queryInterface.dropTable('Hospitals')
    },
}
