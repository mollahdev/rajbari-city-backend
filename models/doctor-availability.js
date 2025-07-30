'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class DoctorAvailability extends Model {
        static associate(models) {
            DoctorAvailability.belongsTo(models.Doctor, {
                foreignKey: 'doctorId',
                as: 'availabilities',
            })
        }
    }

    DoctorAvailability.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4, // Ensures automatic UUID generation
                primaryKey: true,
                allowNull: false,
            },
            doctorId: {
                type: DataTypes.UUID,
                allowNull: false, // Ensures it's always provided
                references: {
                    model: 'Doctors', // Assuming the Users table exists
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            isAvailable: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true, // Default to available
            },
            day: {
                type: DataTypes.ENUM(
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
            startTime: {
                type: DataTypes.TIME,
                allowNull: false,
            },
            endTime: {
                type: DataTypes.TIME,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'DoctorAvailability',
            tableName: 'DoctorAvailabilities',
            timestamps: true,
            underscored: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            indexes: [
                {
                    fields: ['doctor_id'],
                    name: 'doctor_availability_doctor_id_index',
                },
                {
                    fields: ['day'],
                    name: 'doctor_availability_day_index',
                },
            ],
        }
    )

    return DoctorAvailability
}
