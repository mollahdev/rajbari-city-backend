'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class DiagnosticService extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            DiagnosticService.belongsTo(models.Diagnostic, {
                foreignKey: 'diagnostic_id',
                as: 'services',
            })

            DiagnosticService.belongsTo(models.Service, {
                foreignKey: 'service_id',
                as: 'service',
            })
        }
    }

    DiagnosticService.init(
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                unique: true,
                defaultValue: DataTypes.UUIDV4,
            },
            diagnosticId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'Diagnostics',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            serviceId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'Services',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
        },
        {
            sequelize,
            modelName: 'DiagnosticService',
            tableName: 'DiagnosticServices',
            timestamps: true,
            underscored: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
        }
    )

    return DiagnosticService
}
