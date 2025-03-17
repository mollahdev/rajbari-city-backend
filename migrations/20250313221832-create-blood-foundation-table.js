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
                allowNull: false
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
            timestamps: true
        })

        await queryInterface.addIndex('BloodFoundations', ['user_id'], {
            name: 'blood_foundation_user_id_index',
        })

        await queryInterface.addIndex('BloodFoundations', ['district'], {
            name: 'blood_foundation_district_index',
        })

        await queryInterface.addIndex('BloodFoundations', ['upazila'], {
            name: 'blood_foundation_upazila_index',
        })

        await queryInterface.addIndex('BloodFoundations', ['union'], {
            name: 'blood_foundation_union_index',
        })

        await queryInterface.addIndex('BloodFoundations', ['municipality'], {
            name: 'blood_foundation_municipality_index'
        })

        await queryInterface.addIndex('BloodFoundations', ['status'], {
            name: 'blood_foundation_status_index'
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('BloodFoundations', 'user_id');
        await queryInterface.removeIndex('BloodFoundations', 'district');
        await queryInterface.removeIndex('BloodFoundations', 'upazila');
        await queryInterface.removeIndex('BloodFoundations', 'union');
        await queryInterface.removeIndex('BloodFoundations', 'municipality');
        await queryInterface.removeIndex('BloodFoundations', 'status');

        await queryInterface.dropTable('BloodFoundations')
    },
}
