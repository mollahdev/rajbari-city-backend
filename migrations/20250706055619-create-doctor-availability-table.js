'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'DoctorAvailabilities',
            {
                id: {
                    type: Sequelize.UUID, // Ensures UUID type
                    defaultValue: Sequelize.UUIDV4, // Generates UUID automatically
                    primaryKey: true,
                    allowNull: false,
                },
                doctor_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: {
                        model: 'Doctors',
                        key: 'id',
                    },
                    onDelete: 'CASCADE',
                },
                location_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                },
                is_available: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                day: {
                    type: Sequelize.ENUM(
                        'saturday',
                        'sunday',
                        'monday',
                        'tuesday',
                        'wednesday',
                        'thursday',
                        'friday'
                    ),
                    allowNull: false,
                },
                start_time: {
                    type: Sequelize.TIME,
                    allowNull: false,
                },
                end_time: {
                    type: Sequelize.TIME,
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

        // Add index
        await queryInterface.addIndex('DoctorAvailabilities', ['doctor_id'], {
            name: 'doctor_id_index',
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex(
            'DoctorAvailabilities',
            'doctor_id_index'
        )
        await queryInterface.dropTable('DoctorAvailabilities')
    },
}
